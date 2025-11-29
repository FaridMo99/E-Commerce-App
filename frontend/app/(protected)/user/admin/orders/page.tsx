import OrdersTable from './components/OrdersTable';

function page() {
  return (
    <>
      <h1 className="self-start text-2xl text-white">Orders</h1>
      <OrdersTable />
    </>
  );
}

export default page