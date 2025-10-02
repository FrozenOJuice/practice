from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import Optional
from backend.movies import schemas
from backend.movies import utils as movie_utils
from backend.authentication.security import get_current_user
from backend.authentication import utils as auth_utils
import uuid
from datetime import datetime

router = APIRouter(prefix="/movies", tags=["movies"])

@router.get("/", response_model=schemas.MovieListResponse)
def get_movies(
    genre: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    sort_by: Optional[str] = Query(None, enum=["rating", "date"]),
    order: Optional[str] = Query("asc", enum=["asc", "desc"])
):
    movies = movie_utils.load_movies()

    # Filter
    if genre:
        movies = [m for m in movies if genre in m["metadata"]["movieGenres"]]
    if min_rating is not None:
        movies = [m for m in movies if m["metadata"]["movieIMDbRating"] >= min_rating]
    if max_rating is not None:
        movies = [m for m in movies if m["metadata"]["movieIMDbRating"] <= max_rating]

    # Sort
    if sort_by == "rating":
        movies.sort(key=lambda m: m["metadata"]["movieIMDbRating"], reverse=(order=="desc"))
    elif sort_by == "date":
        movies.sort(key=lambda m: m["metadata"]["datePublished"], reverse=(order=="desc"))

    return {"movies": movies}

@router.get("/{movie_id}", response_model=schemas.Movie)
def get_movie(movie_id: str):
    movie = movie_utils.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

@router.get("/search/", response_model=schemas.MovieListResponse)
def search_movies(
    title: Optional[str] = None,
    rating: Optional[float] = None
):
    movies = movie_utils.load_movies()
    if title:
        movies = [m for m in movies if title.lower() in m["metadata"]["title"].lower()]
    if rating is not None:
        movies = [m for m in movies if m["metadata"]["movieIMDbRating"] >= rating]
    return {"movies": movies}

# --- NEW: Reviews route ---
@router.get("/{movie_id}/reviews", response_model=schemas.ReviewListResponse)
def get_reviews(
    movie_id: str,
    user: Optional[str] = None,
    start_date: Optional[str] = None,  # ISO format: YYYY-MM-DD
    end_date: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    min_usefulness_vote: Optional[int] = None,
    min_total_votes: Optional[int] = None,
    skip: int = 0,
    limit: int = 50  # default max number of reviews returned
):
    movie = movie_utils.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    reviews = movie_utils.load_reviews(movie_id)

    # --- Filters ---
    if user:
        reviews = [r for r in reviews if r["user"] and user.lower() in r["user"].lower()]
    if start_date:
        reviews = [r for r in reviews if r["date"] and r["date"] >= start_date]
    if end_date:
        reviews = [r for r in reviews if r["date"] and r["date"] <= end_date]
    if min_rating is not None:
        reviews = [r for r in reviews if r["rating"] is not None and r["rating"] >= min_rating]
    if max_rating is not None:
        reviews = [r for r in reviews if r["rating"] is not None and r["rating"] <= max_rating]
    if min_usefulness_vote is not None:
        reviews = [r for r in reviews if r["usefulness_vote"] is not None and r["usefulness_vote"] >= min_usefulness_vote]
    if min_total_votes is not None:
        reviews = [r for r in reviews if r["total_votes"] is not None and r["total_votes"] >= min_total_votes]

    # --- Pagination ---
    reviews = reviews[skip : skip + limit]

    return {"reviews": reviews}


@router.post("/{movie_id}/reviews")
def add_review(
    movie_id: str,
    review_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Add a new review for a movie.
    Requires authentication.
    """

    users = auth_utils.load_users()
    user = next((u for u in users if u['user_id'] == current_user.user_id), None)

    # Extract review fields from request
    rating = review_data.get("rating")
    title = review_data.get("review_title")
    review_text = review_data.get("review_text")

    if not rating or not title or not review_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields: rating, review_title, review_text"
        )

    # Append review to movie's CSV
    new_review = movie_utils.append_review_to_csv(
        movie_id=movie_id,
        username=user["username"],
        rating=rating,
        title=title,
        review_text=review_text
    )

    return {
        "message": "Review added successfully",
        "review": new_review
    }
