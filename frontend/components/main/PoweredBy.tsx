import Link from 'next/link'

type PoweredByProps = {
    by: string
    text: string
    link:string
}
function PoweredBy({by,text,link}:PoweredByProps) {
  return (
    <p>
          {text}<Link href={ link }>{by}</Link>
    </p>
  );
}

export default PoweredBy