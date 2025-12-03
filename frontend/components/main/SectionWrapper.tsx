import React, { ReactNode } from 'react'

type SectionWrapperProps = {
  as?:"main" | "section"
    header: string;
  children: ReactNode
    styles:string
}

function SectionWrapper({ header, children, styles, as = "section" }: SectionWrapperProps) {
    const Tag = as;

  return (
    <Tag className={styles}>
      <h2 className="text-3xl font-extrabold mb-2">{header}</h2>
      {children}
    </Tag>
  );
}

export default SectionWrapper