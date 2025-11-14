import { verifyAfterEmailLink } from '@/lib/queries/authQueries'
import useAuth from '@/stores/authStore'
import "server-only"

//get query param and make request to verify account
//!token make proper handling, maybe error page etc.
async function page({ searchParams }: { searchParams?: { token: string } }) {

    const param = await searchParams
    if (!param?.token) return
    const token = param.token;

    const res = await verifyAfterEmailLink(token)
    useAuth.setState({ user: res.user, isAuthenticated: true, accessToken: res.accessToken })
    

  return (
      <div>{ token}</div>
  )
}

export default page