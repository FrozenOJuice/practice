//Register
export interface RegisterData {
    username: string;
    email: string;
    password: string;
    role: string;
}
  
  export interface ApiResponse<T> {
    data?: T;
    error?: string;
}
  
export async function registerUser(userData: RegisterData): Promise<ApiResponse<any>> {
  try {
      const response = await fetch('http://localhost:8000/auth/register', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
      });



      const data = await response.json();
  
      if (!response.ok) {
          return { error: data.detail || 'Registration failed' };
      }
  
      return { data };
  } catch (error) {
      return { error: 'Network error. Please try again.' };
  }
}


// Login
export interface LoginData {
    username: string;
    password: string;
}
  
  export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}
  
export async function loginUser(loginData: LoginData): Promise<ApiResponse<TokenResponse>> {
  // Use URLSearchParams to match OAuth2PasswordRequestForm format
  const formData = new URLSearchParams();
  formData.append('username', loginData.username);
  formData.append('password', loginData.password);

  try {
      const response = await fetch('http://localhost:8000/auth/login', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
      });

      const data = await response.json();
  
      if (!response.ok) {
          return { error: data.detail || 'Login failed' };
      }
  
      return { data };
  } catch (error) {
      return { error: 'Network error. Please try again.' };
  }
}


// Movies
export interface Movie {
    id: string;
    metadata: {
      title: string;
      movieIMDbRating: number;
      movieGenres: string[];
      directors: string[];
      datePublished: string;
      description: string;
      duration: number;
    };
  }
  
export async function getMovies(filters?: {
  genre?: string;
  min_rating?: number;
  max_rating?: number;
  sort_by?: string;
  order?: string;
}): Promise<ApiResponse<Movie[]>> {
  try {
    const params = new URLSearchParams();
    if (filters?.genre) params.append('genre', filters.genre);
    if (filters?.min_rating) params.append('min_rating', filters.min_rating.toString());
    if (filters?.max_rating) params.append('max_rating', filters.max_rating.toString());
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.order) params.append('order', filters.order);

    const url = `http://localhost:8000/movies/${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.detail || 'Failed to fetch movies' };
    }

    return { data: data.movies };
  } catch (error) {
    return { error: 'Network error. Please try again.' };
  }
}

// Get Movie by ID
export async function getMovieById(movieId: string): Promise<ApiResponse<Movie>> {
  try {
    const response = await fetch(`http://localhost:8000/movies/${movieId}`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.detail || 'Movie not found' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error. Please try again.' };
  }
}

// Add to frontend/app/utils/api.ts
export interface Review {
  date: string;
  user: string;
  usefulness_vote: number;
  total_votes: number;
  rating: number;
  title: string;
  review: string;
}

export async function getMovieReviews(movieId: string): Promise<ApiResponse<Review[]>> {
  try {
    const response = await fetch(`http://localhost:8000/movies/${movieId}/reviews`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.detail || 'Failed to fetch reviews' };
    }

    return { data: data.reviews };
  } catch (error) {
    return { error: 'Network error. Please try again.' };
  }
}