import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SingleSelectItem = {
    value: string,
    title:string
}

type SidebarSelectProps = {
  valueChangeHandler: (value: string) => void;
  value: string;
  placeholder: string;
  label: string;
  selectItems: SingleSelectItem[];
};



function SidebarSelect({valueChangeHandler,placeholder,label,selectItems, value}:SidebarSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={valueChangeHandler}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {selectItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>{item.title}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default SidebarSelect