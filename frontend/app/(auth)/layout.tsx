import React from 'react'

//for protecting routes if !== authenticated allowed if ===authenticated redirect
function layout({children}:{children:React.ReactNode}) {
  return children
}

export default layout