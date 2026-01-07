import NotFound from "@/components/main/NotFound"
import { PackageSearch } from "lucide-react"


function notFound() {
  return <NotFound icon={PackageSearch} text="Product not found..."/>
}

export default notFound