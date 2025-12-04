import SectionWrapper from '@/components/main/SectionWrapper';
import OrdersTable from './components/OrdersTable';

function page() {
  return (
    <SectionWrapper header="Orders" styles="w-full">
      <OrdersTable />
    </SectionWrapper>
  );
}

export default page