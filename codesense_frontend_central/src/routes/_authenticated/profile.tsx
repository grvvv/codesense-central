import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import { formatTimestamp } from '@/utils/timestampFormater'
import { Card, CardContent, CardHeader } from '@/components/atomic/card'
import { DotsLoader } from '@/components/atomic/loader'

export const Route = createFileRoute('/_authenticated/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user, isLoading, error } = useAuth()

  if (isLoading) return <DotsLoader />

  if (error) {
    return (
      <Card className="py-0 overflow-hidden">
        <div className="p-6" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="flex justify-center items-center py-8">
            <div className="text-red-600">Error: {error.message}</div>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold mb-2 flex items-center">
              Profile
            </h2>
          </CardHeader>
          
          <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">User Name</label>
                <div className="p-3 bg-muted rounded-md border">
                  <span className="text-foreground capitalize">{user?.name}</span>
                </div>
              </div>
            </div>

            {/* Email and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="p-3 bg-muted rounded-md border">
                  <span className="text-foreground">{user?.email}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <div className="p-3 bg-muted rounded-md border">
                  <span className="text-foreground capitalize">{user?.role}</span>
                </div>
              </div>
            </div>

            {/* Created At and Last Updated */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Created At</label>
                <div className="p-3 bg-muted rounded-md border">
                  <span className="text-foreground">{formatTimestamp(user?.created_at)}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Last Updated</label>
                <div className="p-3 bg-muted rounded-md border">
                  <span className="text-foreground">{formatTimestamp(user?.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
          </CardContent>
          
        </Card>

      </div>
    </div>
  )
}