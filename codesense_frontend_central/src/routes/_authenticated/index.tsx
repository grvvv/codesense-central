
import { DotsLoader } from '@/components/atomic/loader'
import Dashboard from '@/components/charts/dashboard'
import { Unauthorized } from '@/components/molecule/unauthorized'
import { authService } from '@/lib/auth'
import { generalService } from '@/services/general.service'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
 
export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: () => {
    authService.requireAuth();
  },
  component: Index,
})
 
function Index() {
  let { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => generalService.fetchDashboard(),
  });

  let navigate = useNavigate()

  if (isLoading) return <DotsLoader />

  if (isError) {
    return <Unauthorized onBack={navigate({to: '/'})} onHome={navigate({to: '/'})} variant='default' />
  }

  return (
    <div className="p-2">
      <div className="h-full w-full overflow-hidden">
        <Dashboard data={data.license} />
      </div>
     
    </div>
  )
}
 