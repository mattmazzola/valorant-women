import { ActionFunction, DataFunctionArgs, json, LinksFunction } from "@remix-run/node"
import { Form, Outlet, useFetcher, useLoaderData, useNavigate, useSearchParams } from "@remix-run/react"
import Rating from "~/components/Rating"
import ratingStyles from '~/components/Rating.css'
import ratingsStyles from '~/components/Ratings.css'
import Toggle from '~/components/Toggle'
import toggleStyles from '~/components/Toggle.css'
import { femaleAgents, femaleSex, maleAgents, maleSex } from "~/constants"
import { getActiveSex, getObjectFromSubmission, getSubmissionFromObject } from "~/helpers"
import { Submission } from "~/models"
import { auth, getSession } from "~/services/auth.server"
import { postRating } from "~/services/ratingsService"
import ratingIndexStyles from '~/styles/rating.css'


export const links: LinksFunction = () => [
    { rel: 'stylesheet', href: toggleStyles },
    { rel: 'stylesheet', href: ratingIndexStyles },
    { rel: 'stylesheet', href: ratingsStyles },
    { rel: 'stylesheet', href: ratingStyles },
]

enum FormSubmissionOutcomes {
    RegistrationError = 'RegistrationError',
    RegistrationSuccess = 'RegistrationSuccess',
    SignInError = 'SignInError',
    SignInSuccess = 'SignInSuccess',
    SubmitRating = 'SubmitRating',
}

type LoaderError = { message: string } | null

export const loader = async ({ request }: DataFunctionArgs) => {
    const activeSex = await getActiveSex(request)
    const profile = await auth.isAuthenticated(request)
    const session = await getSession(request.headers.get("Cookie"))
    const error = session.get(auth.sessionErrorKey) as LoaderError

    return json({
        activeSex,
        profile,
        error,
    })
}

export const action: ActionFunction = async ({ request }) => {
    const rawFormData = await request.formData()
    const formData = Object.fromEntries(rawFormData)
    const formName = formData.name as string
    const formOutcome = formName as FormSubmissionOutcomes

    console.log(formName.toUpperCase())

    if (formOutcome === FormSubmissionOutcomes.SubmitRating) {
        const ratingInput = getSubmissionFromObject(formData)
        const savedRating = await postRating(ratingInput)

        return {
            savedRating
        }
    }

    return null
}

export default function RatingRoute() {
    const ratingFetcher = useFetcher()
    const loaderData = useLoaderData<typeof loader>()
    console.log({ loaderData })
    const { profile, activeSex, error } = loaderData

    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const onChangeAgentType = (agentType: boolean) => {
        const sex = agentType ? femaleSex : maleSex
        const paramsObj = { activeSex: sex }
        const searchParams = new URLSearchParams(paramsObj)

        navigate(`${sex.toLowerCase()}?${searchParams}`)
    }

    const onSubmitRating = (submission: Submission) => {
        const submissionFormData = getObjectFromSubmission(submission)
        const data = {
            name: FormSubmissionOutcomes.SubmitRating,
            ...submissionFormData
        }

        ratingFetcher.submit(data, { method: 'post' })
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
            {(profile !== null && typeof profile === 'object')
                ? (
                    <section>
                        <div className="rating-form">
                            <label htmlFor="userName">Name:</label>
                            <input
                                type="text"
                                name="name"
                                id="userName"
                                value={profile?.displayName ?? "Unknown User"}
                                readOnly
                            />
                            <Form method="post" action="/logout">
                                <button type="submit">Sign Out</button>
                            </Form>
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
                                <Form method="post" action="/auth">
                                    {error ? <div>{error.message}</div> : null}
                                    <p>
                                        <button type="submit" className="login orangeButton">Sign In</button>
                                    </p>
                                    <div>You must sign in before you may rate the characters.</div>
                                </Form>
                            </div>
                        </div>
                    </section>
                )}
            <Outlet />
        </>
    )
}