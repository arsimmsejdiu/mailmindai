import { useQueryClient } from '@tanstack/react-query'

const useRefetch = () => {
  // re-fetches all active trpc queries
  const queryClient = useQueryClient()
  return async () => {
    await queryClient.refetchQueries({ type: 'active' })
  }
}

export default useRefetch