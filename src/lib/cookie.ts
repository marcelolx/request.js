export function getCookie (name: string | null) {
  if (!name) return;
  
  const cookies = document.cookie ? document.cookie.split('; ') : []
  const prefix = `${encodeURIComponent(name)}=`
  const cookie = cookies.find(cookie => cookie.startsWith(prefix))

  if (cookie) {
    const value = cookie.split('=').slice(1).join('=')

    if (value) {
      return decodeURIComponent(value)
    }
  }
}
