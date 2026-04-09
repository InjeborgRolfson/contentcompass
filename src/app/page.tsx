import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import HomeClient from "@/components/HomeClient";

async function TodoList() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <ul className="p-8">
      {todos?.map((todo: any) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}

export default async function Page() {
  return (
    <>
      <TodoList />
      <HomeClient />
    </>
  )
}
