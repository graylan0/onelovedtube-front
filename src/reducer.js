import {
  GET_RECENT_POSTS_REQUEST,
  GET_RECENT_POSTS_SUCCESS,
  GET_RECENT_POSTS_ERROR,
  GET_SINGLE_POST_REQUEST,
  GET_SINGLE_POST_SUCCESS,
  GET_SINGLE_POST_ERROR
} from './actions/types'

const initialState = {
  posts: [],
  currentPost: null,
  newsfeed: [],
  loadingNewsfeed: false,
  loading: false,
  error: null
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_RECENT_POSTS_REQUEST:
      return {
        ...state,
        loading: true
      }
    case GET_RECENT_POSTS_SUCCESS:
      return {
        ...state,
        posts: action.payload,
        loading: false
      }
    case GET_RECENT_POSTS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    case GET_SINGLE_POST_REQUEST:
      return {
        ...state,
        loading: true
      }
    case GET_SINGLE_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        posts: [...state.posts, action.payload]
      }
    case GET_SINGLE_POST_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    default:
      return state
  }
}
