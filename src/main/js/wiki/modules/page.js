//@flow
import apiClient from '../../apiclient';

const FETCH_PAGE = 'smeagol/page/FETCH';
const FETCH_PAGE_SUCCESS = 'smeagol/page/FETCH_SUCCESS';
const FETCH_PAGE_FAILURE = 'smeagol/page/FETCH_FAILURE';

const FETCH_PAGE_NOTFOUND = 'smeagol/page/FETCH_NOTFOUND';

const EDIT_PAGE = 'smeagol/page/EDIT';
const EDIT_PAGE_SUCCESS = 'smeagol/page/EDIT_SUCCESS';
const EDIT_PAGE_FAILURE = 'smeagol/page/EDIT_FAILURE';

const CREATE_PAGE = 'smeagol/page/CREATE';
const CREATE_PAGE_SUCCESS = 'smeagol/page/CREATE_SUCCESS';
const CREATE_PAGE_FAILURE = 'smeagol/page/CREATE_FAILURE';

function requestPage(url: string) {
    return {
        type: FETCH_PAGE,
        url
    };
}

function receivePage(url: string, page: any) {
    return {
        type: FETCH_PAGE_SUCCESS,
        payload: page,
        url
    };
}

function failedToFetchPage(url: string, err: Error) {
    return {
        type: FETCH_PAGE_FAILURE,
        payload: err,
        url
    };
}

function pageNotFound(url: string) {
    return {
        type: FETCH_PAGE_NOTFOUND,
        url
    };
}

const PAGE_NOTFOUND_ERROR = new Error('page not found');

function fetchPage(url: string) {
    return function(dispatch) {
        dispatch(requestPage(url));
        return apiClient.get(url)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw PAGE_NOTFOUND_ERROR;
                    }
                    throw new Error('server returned status code' + response.status);
                }
                return response;
            })
            .then(response => response.json())
            .then(json => dispatch(receivePage(url, json)))
            .catch((err) => {
                if (err === PAGE_NOTFOUND_ERROR) {
                    dispatch(pageNotFound(url));
                } else {
                    dispatch(failedToFetchPage(url, err));
                }
            });
    }
}

export function createPageUrl(repositoryId: string, branch: string, path: string) {
    return `/repositories/${repositoryId}/branches/${branch}/pages/${path}`;
}

export function shouldFetchPage(state: any, url: string): boolean {
    const byUrl = state.page[url];
    if (byUrl) {
        return ! (byUrl.error || byUrl.loading || byUrl.notFound || byUrl.page);
    }
    return true;
}

export function fetchPageIfNeeded(url: string) {
    return function(dispatch, getState) {
        if (shouldFetchPage(getState(), url)) {
            dispatch(fetchPage(url));
        }
    }
}

function requestEditPage(url: string) {
    return {
        type: EDIT_PAGE,
        url
    };
}

function editPageSuccess(url: string) {
    return {
        type: EDIT_PAGE_SUCCESS,
        url
    };
}

function editPageFailure(url: string, err: Error) {
    return {
        type: EDIT_PAGE_FAILURE,
        payload: err,
        url
    };
}

export function editPage(url: string, message: string, content: string) {
    return function(dispatch) {
        dispatch(requestEditPage(url));
        return apiClient.post(url, { message: message, content: content })
            .then(() => dispatch(editPageSuccess(url)))
            .catch((err) => dispatch(editPageFailure(url, err)));
    }
}

function requestCreatePage(url: string) {
    return {
        type: CREATE_PAGE,
        url
    };
}

function createPageSuccess(url: string) {
    return {
        type: CREATE_PAGE_SUCCESS,
        url
    };
}

function createPageFailure(url: string, err: Error) {
    return {
        type: CREATE_PAGE_FAILURE,
        payload: err,
        url
    };
}

export function createPage(url: string, message: string, content: string) {
    return function(dispatch) {
        dispatch(requestCreatePage(url));
        return apiClient.post(url, { message: message, content: content })
            .then(() => dispatch(createPageSuccess(url)))
            .catch((err) => dispatch(createPageFailure(url, err)));
    }
}

export default function reducer(state = {}, action = {}) {
    switch (action.type) {
        case FETCH_PAGE:
        case EDIT_PAGE:
        case CREATE_PAGE:
            return {
                ...state,
                [action.url] : {
                    loading: true,
                    error: null,
                    notFound: false
                }
            };
        case FETCH_PAGE_SUCCESS:
            return {
                ...state,
                [action.url] : {
                    loading: false,
                    page: action.payload
                }
            };
        case FETCH_PAGE_FAILURE:
        case EDIT_PAGE_FAILURE:
        case CREATE_PAGE_FAILURE:
            return {
                ...state,
                [action.url] : {
                    loading: false,
                    error: action.payload
                }
            };
        case FETCH_PAGE_NOTFOUND:
            return {
                ...state,
                [action.url] : {
                    loading: false,
                    notFound: true
                }
            };
        case CREATE_PAGE_SUCCESS:
        case EDIT_PAGE_SUCCESS:
            return {
                ...state,
                [action.url] : {
                    loading: false,
                    error: null,
                    page: null
                }
            };

        default:
            return state
    }
}