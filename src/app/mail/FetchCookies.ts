"use server"

import { cookies } from 'next/headers';

export const fetchCookies = async () => {
  const layout = (await cookies()).get("react-resizable-panels:layout:mail");
  const collapsed = (await cookies()).get("react-resizable-panels:collapsed");

  return {
    defaultLayout: layout ? JSON.parse(layout.value) : undefined,
    defaultCollapsed: collapsed ? JSON.parse(collapsed.value) : undefined,
  };
}