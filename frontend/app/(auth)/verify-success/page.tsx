import { verifyAfterEmailLink } from '@/lib/queries/authQueries'
import useAuth from '@/stores/authStore'
import "server-only"
import SuccessCard from './components/SuccessCard';


async function page({ searchParams }: { searchParams?: { token: string } }) {
  
    const param = await searchParams;
    if (!param?.token) throw new Error()
    
    
    const token = param.token;

    const res = await verifyAfterEmailLink(token);
    useAuth.setState({
      user: res.user,
      isAuthenticated: true,
      accessToken: res.accessToken,
    });


  return <SuccessCard/>
}

export default page