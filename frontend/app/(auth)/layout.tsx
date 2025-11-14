import React from 'react'

//for protecting routes if !== authenticated allowed if ===authenticated redirect
function layout({children}:{children:React.ReactNode}) {
  return (
      <div className="flex w-full h-full items-center justify-center">
        <div className="w-full max-w-sm">
          {children}
        </div>
    </div>
  )}

export default layout