import { SignIn } from "@clerk/remix"

export default function SignInRoute() {
  return (
    <div>
      <SignIn routing={"path"} path={"/sign-in"} />
    </div>
  )
}
