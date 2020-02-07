import {
  GET_RECENT_POSTS_REQUEST,
  GET_RECENT_POSTS_SUCCESS,
  GET_RECENT_POSTS_ERROR,
  GET_SINGLE_POST_REQUEST,
  GET_SINGLE_POST_SUCCESS,
  GET_SINGLE_POST_ERROR,
} from './types'
import steem from 'steem'

import { getHtml } from '../busy/Body'

steem.api.setOptions({url: 'https://api.steemit.com'})

// actions

const getRecentPostsRequest = () => ({
  type: GET_RECENT_POSTS_REQUEST
})

const getRecentPostsSuccess = posts => ({
  type: GET_RECENT_POSTS_SUCCESS,
  payload: posts
})

const getRecentPostsError = error => ({
  type: GET_RECENT_POSTS_ERROR,
  payload: error
})

const getSinglePostRequest = () => ({
  type: GET_SINGLE_POST_REQUEST
})

const getSinglePostSuccess = post => ({
  type: GET_SINGLE_POST_SUCCESS,
  payload: post
})

const getSinglePostError = error => ({
  type: GET_SINGLE_POST_ERROR,
  payload: error
})

// api calls

function getPosts () {
  return new Promise((res, rej) => {
    steem.api.getDiscussionsByBlog({tag: 'onelovedtube', limit: 50}, function (err, result) {
      if (err) rej(err)
      else res(result)
    })
  })
}

function getPost (permlink) {
  return new Promise((res, rej) => {
    const currentDate = new Date().toISOString().split('.')[0]
    steem.api.getDiscussionsByAuthorBeforeDate('onelovedtube', permlink, currentDate, 1, function (err, result) {
      if (err) rej(err)
      else res(result)
    })
  })
}

function round (number, precision) {
  const shift = function (number, precision, reverseShift) {
    if (reverseShift) {
      precision = -precision
    }
    const numArray = ('' + number).split('e')
    return +(numArray[0] + 'e' + (numArray[1] ? (+numArray[1] + precision) : precision))
  }
  return shift(Math.round(shift(number, precision, false)), precision, true)
}

function formatPostData (postData) {
  const title = postData.title
  const body = postData.body
  const bodyHtml = getHtml(postData.body, {}, 'text')
  const timeSincePosted = new Date(postData.created + 'Z')
  const jsonMetadata = JSON.parse(postData.json_metadata)
  const tags = jsonMetadata.tags
  const numberOfVotes = postData.active_votes.length
  const permlink = postData.permlink

  let isDtube = false
  let isDlive = false
  let isBusy = false
  if (typeof jsonMetadata.video !== 'undefined')
    isDtube = true
  else if (typeof jsonMetadata.community !== 'undefined')
    isBusy = true
  else if (jsonMetadata.tags[0] === 'dlive')
    isDlive = true

  let image
  if (isDlive)
    image = jsonMetadata.thumbnail
  else if (isBusy || isDtube)
    image = bodyHtml.match(/<img.*?src=['"](.*?)['"]/)[1]
  else
    image = jsonMetadata.image[0]

  const pendingPayoutValue =
    Number(postData.pending_payout_value.slice(0, postData.pending_payout_value.indexOf(' '))).toFixed(2)
  const totalPayoutValue =
    Number(postData.total_payout_value.slice(0, postData.total_payout_value.indexOf(' ')))
  const curatorPayoutValue =
    Number(postData.curator_payout_value.slice(0, postData.curator_payout_value.indexOf(' ')))
  const payoutValue =
    Number(pendingPayoutValue) === 0
      ? round(Number(totalPayoutValue) + Number(curatorPayoutValue), 2).toFixed(2)
      : pendingPayoutValue

  return {
    title,
    body,
    bodyHtml,
    timeSincePosted,
    tags,
    image,
    isDtube,
    isDlive,
    isBusy,
    numberOfVotes,
    payoutValue,
    permlink
  }
}

// redux thunks

export const getRecentPosts = () => async dispatch => {
  dispatch(getRecentPostsRequest())

  try {
    const recentPosts = await getPosts()

    const formattedPostsData = recentPosts.map(post => {
      return formatPostData(post)
    })

    dispatch(getRecentPostsSuccess(formattedPostsData))

  } catch (err) {
    console.log('error message: ', err)
    dispatch(getRecentPostsError(err.toString()))
  }
}

export const getSinglePost = permlink => async dispatch => {

  dispatch(getSinglePostRequest())

  try {
    const [singlePost] = await getPost(permlink)

    dispatch(getSinglePostSuccess(formatPostData(singlePost)))

  } catch (err) {
    dispatch(getSinglePostError(err))
  }
}
