import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';


const GitHubContext = React.createContext()

const GithubProvider = ({children}) => {

    const [githubUser,setGithubUser] = useState(mockUser)
    const [repos,setRepos] = useState(mockRepos)
    const [followers,setFollowers] = useState(mockFollowers)


    const [requests,setRequests] = useState(0)
    const [isLoading,setIsLoading] = useState(false)

    const [error,setError] = useState({
        show : false,
        message : ''
    })

    const searchGithubUser = async (user) => {
        toggleError()
        setIsLoading(true)
        const response = await axios(`${rootUrl}/users/${user}`)
            .catch((error) => 
            console.log(error)
        )
        console.log(response)
        if(response) {
            setGithubUser(response.data)
            const {login,followers_url} = response.data
            await axios(`${rootUrl}/users/${login}/repos?per_page=100`)
                .then((response) => {
                    setRepos(response.data)
                })
            await axios(`${followers_url}?per_page=100`).then((response) => {
                setFollowers(response.data)
            })
        }else {
            toggleError(true , 'there is no user with that username')
        }

        checkRequests()
        setIsLoading(false)

    }

    const checkRequests = () => {
        axios(`${rootUrl}/rate_limit`)
            .then(({data}) => {
                let {rate : {remaining}} = data
                setRequests(remaining)
                if(remaining === 0) {
                    toggleError(true,'sorry, you have exceeded your hourly rate limit!')
                }
            })
            .catch((error) => console.log(error))
    }

    function toggleError(show = false,message = '') {
        setError({show,message})
    }

    useEffect(() => {
        checkRequests()
    }, [])

    return (
        <GitHubContext.Provider value={{
            githubUser,
            repos,
            followers,
            requests,
            error,
            searchGithubUser,
            isLoading
        }}>
            {children}
        </GitHubContext.Provider>
    )
}

export {GithubProvider , GitHubContext}