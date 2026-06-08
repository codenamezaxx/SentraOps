import { createClient } from './server'
import { Profile, Store } from '../types'

export async function getUserProfile() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  return profile as Profile | null
}

export async function getStore(storeId: string) {
  const supabase = await createClient()
  
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single()

  return store as Store | null
}

export async function getUserContext() {
  const profile = await getUserProfile()
  if (!profile) return null

  const store = await getStore(profile.store_id)
  return { profile, store }
}