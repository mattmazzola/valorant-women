import { SignOutButton, SignedIn, SignedOut, useUser } from "@clerk/remix"
import { getAuth } from "@clerk/remix/ssr.server"
import { ActionArgs, LinksFunction, LoaderArgs, json } from "@remix-run/node"
import { Link, Outlet, useActionData, useFetcher, useLoaderData, useNavigate } from "@remix-run/react"
import Rating from "~/components/Rating"
import ratingStyles from '~/components/Rating.css'
import ratingsStyles from '~/components/Ratings.css'
import Toggle from '~/components/Toggle'
import toggleStyles from '~/components/Toggle.css'
import { femaleAgents, femaleSex, maleAgents, maleSex } from "~/constants"
import { getActiveSex, getObjectFromSubmission, getSubmissionFromObject } from "~/helpers"
import { Submission } from "~/models"
import { commitSession, getSession } from "~/services/auth.server"
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

const postErrorKey = 'postErrorKey'
export const hasUserSubmittedMaleRatingKey = 'hasUserSubmittedMaleRatingKey'
export const hasUserSubmittedFemaleRatingKey = 'hasUserSubmittedFemaleRatingKey'

export const loader = async (args: LoaderArgs) => {
  const activeSex = await getActiveSex(args.request)
  const { userId } = await getAuth(args)
  const session = await getSession(args.request.headers.get("Cookie"))
  const postError = session.get(postErrorKey) as string
  const hasUserSubmittedFemaleRating = session.get(hasUserSubmittedFemaleRatingKey) as boolean
  const hasUserSubmittedMaleRating = session.get(hasUserSubmittedMaleRatingKey) as boolean

  return json({
    activeSex,
    userId,
    postError,
    hasUserSubmittedFemaleRating,
    hasUserSubmittedMaleRating,
  })
}

export const action = async (args: ActionArgs) => {
  const { userId } = await getAuth(args)
  if (!userId) {
    return null
  }

  const rawFormData = await args.request.formData()
  const formData = Object.fromEntries(rawFormData)
  const formName = formData.name as string
  const formOutcome = formName as FormSubmissionOutcomes

  if (formOutcome === FormSubmissionOutcomes.SubmitRating) {
    const ratingInput = getSubmissionFromObject(formData)
    try {
      const savedRating = await postRating(ratingInput, userId)
      const session = await getSession(args.request.headers.get("Cookie"))

      // TODO: Setting cookie here may be redundent since we it in loader also
      const sexKey = ratingInput.isWomen
        ? hasUserSubmittedFemaleRatingKey
        : hasUserSubmittedMaleRatingKey
      session.set(sexKey, true)

      return json({
        savedRating,
      }, {
        headers: {
          "Set-Cookie": await commitSession(session),
        }
      })
    }
    catch (e) {
      const message = e as string
      console.error('postRating failed', { message })

      const session = await getSession(args.request.headers.get("Cookie"))
      session.flash(postErrorKey, message)

      return json({
        error: message
      }, {
        headers: {
          'Cookie': await commitSession(session)
        }
      })
    }
  }

  return null
}

export default function RatingRoute() {
  const ratingFetcher = useFetcher()
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const { user } = useUser()
  const { activeSex, hasUserSubmittedFemaleRating, hasUserSubmittedMaleRating } = loaderData
  console.log({ loaderData, actionData, user })

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
      <SignedIn>
        <section>
          <div className="rating-form">
            <label htmlFor="userName">Name:</label>
            <input
              type="text"
              name="name"
              id="userName"
              value={user?.username ?? user?.fullName ?? "Unknown User"}
              readOnly
            />
            <SignOutButton />
          </div>
          <p>Drag and re-order each character into your preferred position, then submit your order!</p>
          {activeSex === femaleSex
            ? hasUserSubmittedFemaleRating
              ? (
                <section>
                  <h2>⚠️ You have already submitted a rating! You may not submit another.</h2>
                </section>
              )
              : <Rating onSubmit={onSubmitRating} agents={femaleAgents} gender="women" key="women" disabled={hasUserSubmittedFemaleRating} />
            : hasUserSubmittedMaleRating
              ? (
                <section>
                  <h2>⚠️ You have already submitted a rating! You may not submit another.</h2>
                </section>
              )
              : <Rating onSubmit={onSubmitRating} agents={maleAgents} gender="men" key="men" disabled={hasUserSubmittedMaleRating} />}
        </section>
      </SignedIn>
      <SignedOut>
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
              <div>
                <Link to="/sign-in" className="login orangeButton">Sign In</Link>
              </div>
              <div>You must sign in before you may rate the characters.</div>
            </div>
          </div>
        </section>
      </SignedOut>
      {actionData != null && typeof actionData === 'object' && (actionData as any).error && (
        <section>
          Error: {(actionData as any).error}
        </section>
      )}
      <Outlet />
    </>
  )
}
