import * as webauthn from '@passwordless-id/webauthn'
import { ActionFunction, json, LinksFunction, LoaderFunction, redirect } from "@remix-run/node"
import { Link, Outlet, useFetcher, useLoaderData, useNavigate, useSearchParams } from "@remix-run/react"
import React, { useEffect } from "react"
import Rating from "~/components/Rating"
import ratingStyles from '~/components/Rating.css'
import ratingsStyles from '~/components/Ratings.css'
import Toggle from '~/components/Toggle'
import toggleStyles from '~/components/Toggle.css'
import { femaleAgents, femaleSex, maleAgents, maleSex } from "~/constants"
import { getActiveSex, getObjectFromSubmission, getSubmissionFromObject } from "~/helpers"
import { Submission } from "~/models"
import { postRating } from "~/service/ratingsService"
import { commitSession, getSession } from "~/sessions"
import ratingIndexStyles from '~/styles/rating.css'

export const links: LinksFunction = () => [
    { rel: 'stylesheet', href: toggleStyles },
    { rel: 'stylesheet', href: ratingIndexStyles },
    { rel: 'stylesheet', href: ratingsStyles },
    { rel: 'stylesheet', href: ratingStyles },
]

type LoaderData = {
    activeSex: string
    username?: string
    credentialId?: string
    signature?: string
    errorType?: string
    errorMessage?: string
}

export const loader: LoaderFunction = async ({ request }) => {
    const activeSex = await getActiveSex(request)
    const session = await getSession(request.headers.get("Cookie"))

    const username = session.get('username')
    const credentialId = session.get('credentialId')
    const signature = session.get('signature')
    const errorType = session.get('errorType')
    const errorMessage = session.get('errorMessage')

    return json<LoaderData>(
        {
            activeSex,
            username,
            credentialId,
            signature,
            errorType,
            errorMessage,
        },
        {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        }
    )
}

export const action: ActionFunction = async ({ request }) => {
    const rawFormData = await request.formData()
    const formData = Object.fromEntries(rawFormData)
    const formName = formData.name as string
    const url = new URL(request.url)
    const session = await getSession(request.headers.get("Cookie"))

    if (formName === "registration") {
        session.set('username', formData.username)
        session.set('credentialId', formData.credentialId)
        session.unset("errorType")
        session.unset("errorMessage")

        console.log(`Set credentialId on session`, { searchParams: url.searchParams.toString() })

        return redirect(`rating?${url.searchParams}`, {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        })
    }
    else if (formName === "registrationError") {
        console.log(`REGISTRAION ERROR`)
        session.set("errorType", formData.type)
        session.set("errorMessage", formData.errorMessage)

        return redirect(`rating?${url.searchParams}`, {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        })
    }
    else if (formName === "signInError") {
        console.log(`SIGN-IN ERROR`)
        session.set("errorType", formData.type)
        session.set("errorMessage", formData.errorMessage)

        return redirect(`rating?${url.searchParams}`, {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        })
    }
    else if (formName === "signIn") {
        session.set('signature', formData.signature)
        session.unset("errorType")
        session.unset("errorMessage")

        return redirect(`rating?${url.searchParams}`, {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        })
    }
    else if (formName === "submitRating") {
        const ratingInput = getSubmissionFromObject(formData)
        const savedRating = await postRating(ratingInput)

        return {
            savedRating
        }
    }

    return null
}

export default function RatingRoute() {
    const registrationFetcher = useFetcher()
    const signInFetcher = useFetcher()
    const ratingFetcher = useFetcher()
    const { activeSex, username, credentialId, signature, errorMessage, errorType } = useLoaderData<LoaderData>()
    console.log({ activeSex, username, credentialId, signature, errorMessage, errorType })
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [isWebAuthNAvailable, setIsWebAuthNAvailable] = React.useState(false)
    const [isLocalAuthenticator, setIsLocalAuthenticator] = React.useState(false)
    const isRegistered = typeof credentialId === 'string'

    useEffect(() => {
        setIsWebAuthNAvailable(webauthn.isAvailable())

        async function fetchIsLocalAuthenticator() {
            const isDeviceAnAuthenticator = await webauthn.isLocalAuthenticator()
            setIsLocalAuthenticator(isDeviceAnAuthenticator)
        }

        fetchIsLocalAuthenticator()
    }, [])

    const onChangeAgentType = (agentType: boolean) => {
        const sex = agentType ? femaleSex : maleSex
        const paramsObj = { activeSex: sex }
        const searchParams = new URLSearchParams(paramsObj)

        navigate(`${sex.toLowerCase()}?${searchParams}`)
    }

    const onSubmitRating = (submission: Submission) => {
        const submissionFormData = getObjectFromSubmission(submission)
        const data = {
            name: "submitRating",
            ...submissionFormData
        }

        ratingFetcher.submit(data, { method: 'post' })
    }

    const [userAlias, setUserAlias] = React.useState('')
    const onChangeUserAlias: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const value = e.target.value
        setUserAlias(value)
    }
    const onKeyDownUserAlias: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        switch (e.key) {
            case 'Escape': {
                setUserAlias('')
            }
        }
    }

    const onClickRegister = async (userName: string) => {
        const uuid = window.crypto.randomUUID()

        try {
            const webAuthNResponse = await webauthn.register(userName, uuid, {
                debug: true
            })

            const username = webAuthNResponse.username
            const credentialId = webAuthNResponse.credential.id

            registrationFetcher.submit({
                name: "registration",
                username,
                credentialId,
            }, {
                method: 'post'
            })
        }
        catch (e) {
            const error = e as Error

            registrationFetcher.submit({
                name: "registrationError",
                errorType: error.name,
                errorMessage: error.message,
            }, {
                method: 'post'
            })
        }
    }

    const onClickSignIn: React.MouseEventHandler<HTMLButtonElement> = async () => {
        const uuid = window.crypto.randomUUID()
        const credentialIds: string[] = []
        if (typeof credentialId === 'string') {
            credentialIds.push(credentialId)
        }

        try {
            const loginResponse = await webauthn.login(credentialIds, uuid, {
                debug: true,
            })

            signInFetcher.submit({
                name: "signIn",
                signature: loginResponse.signature,
            }, {
                method: 'post'
            })
        }
        catch (e) {
            const error = e as Error

            signInFetcher.submit({
                name: "signInError",
                errorType: error.name,
                errorMessage: error.message,
            }, {
                method: 'post'
            })
        }
    }

    return (
        <>
            <section>
                <p>Who do you find most attractive from Valorant?</p>
                <div className="toggler">
                    <b></b>
                    <Toggle
                        on={activeSex === femaleSex}
                        onChange={onChangeAgentType}
                        onLabel={femaleSex}
                        offLabel={maleSex}
                    />
                    <b></b>
                </div>
            </section>
            {[username, signature].every(x => typeof x === 'string')
                ? (
                    <section>
                        <div className="rating-form">
                            <label htmlFor="userName">Name:</label>
                            <input
                                type="text"
                                name="name"
                                id="userName"
                                value={username}
                                readOnly
                            />
                            <Link to={`/logout?${searchParams}`}><button type="button">Sign Out</button></Link>
                        </div>
                        <p>Drag and re-order each character into your preferred position, then submit your order!</p>
                        {activeSex === femaleSex
                            ? <Rating onSubmit={onSubmitRating} agents={femaleAgents} gender="women" key="women" />
                            : <Rating onSubmit={onSubmitRating} agents={maleAgents} gender="men" key="men" />}
                    </section>
                )
                : (
                    <section>
                        <div className="rating disabled">
                            <header className="listHeader">
                                <div>
                                    Hottest
                                </div>
                                <div className="arrow left"></div>
                                <div>
                                    Sort Order
                                </div>
                                <div className="arrow right"></div>
                                <div>
                                    Nottest
                                </div>
                            </header>
                            <div className="registration">
                                {isWebAuthNAvailable
                                    ? (
                                        <>
                                            {isLocalAuthenticator
                                                ? <h2>🟢 Your device can act as an authenticator</h2>
                                                : <h2>🔴 Your device can NOT act as an authenticator</h2>}
                                            <h2>🔴 You must log in to submit a rating!</h2>
                                            {typeof errorMessage === 'string' && (
                                                <h2>🔴 {errorMessage}</h2>
                                            )}
                                            <div className="controls">
                                                {isRegistered
                                                    ? <>
                                                        <button type="button" onClick={onClickSignIn} className="login orangeButton">Sign In</button>
                                                    </>
                                                    : <>
                                                        <input
                                                            type="text"
                                                            required
                                                            id="userName"
                                                            name="userName"
                                                            placeholder="randomGuy132"
                                                            className="user-alias"
                                                            value={userAlias}
                                                            onChange={onChangeUserAlias}
                                                            onKeyDown={onKeyDownUserAlias}
                                                        />
                                                        <button type="button" onClick={() => onClickRegister(userAlias)} className="login orangeButton" disabled={userAlias.length === 0}>Register</button>
                                                    </>}
                                            </div>
                                        </>
                                    )
                                    : (
                                        <>
                                            The Web Auth N protocol is not available on your device or client. Please view the page on another compatible device.
                                        </>
                                    )}
                            </div>
                        </div>
                    </section>
                )}
            <Outlet />
        </>
    )
}