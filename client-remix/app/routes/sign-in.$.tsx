import { SignIn } from "@clerk/remix"

export default function SignInRoute() {
  return (
    <div className="justify-center" style={{ paddingTop: '3rem' }}>
      <SignIn routing={"path"} path={"/sign-in"} />
    </div>
  )
}
