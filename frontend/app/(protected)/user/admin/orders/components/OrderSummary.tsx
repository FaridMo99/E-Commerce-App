import ImageWithPlaceholder from "@/components/main/product/ImageWithPlaceholder";
import { Order } from "@/types/types";

function OrderSummary({ order }: { order: Order }) {
  const totalItems = order?.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <section className="border-gray-700 bg-gray-900 text-white p-6 flex gap-6 w-full h-full">
      {/* Items */}
      <div className="flex flex-col gap-2 w-1/3">
        <h2 className="text-xl font-bold border-b pb-2">
          Items ({totalItems})
        </h2>
        {order.items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-4 pb-2">
            <ImageWithPlaceholder
              imageUrls={item.product.imageUrls}
              width="w-40"
              height="h-40"
            />
            <div className="flex flex-col">
              <p className="font-semibold">{item.product.name}</p>
              <p className="text-sm text-gray-300">
                {item.quantity} x {item.price_at_purchase}{" "}
                {item.product.currency}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Order Summary */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold border-b border-gray-700 pb-2">
          Order Summary
        </h2>
        <p>
          <span className="font-semibold">Total Price:</span> {order.total_amount}{" "}
          {order.items[0]?.product.currency}
        </p>
        <p>
          <span className="font-semibold">Ordered At:</span>{" "}
          {new Date(order.ordered_at).toLocaleString()}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {order.status}
        </p>
        <p>
          <span className="font-semibold">Currency:</span> {order.currency}
        </p>
        <p>
          <span className="font-semibold">Total Amount:</span>{" "}
          {order.total_amount}
        </p>
        <p>
          <span className="font-semibold">Payment Method:</span>{" "}
          {order.payment?.method || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Payment Status:</span>{" "}
          {order.payment?.status || "N/A"}
        </p>
      </div>

      {/* Shipping Address */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold border-b border-gray-700 pb-2">
          Shipping Address
        </h2>
        <p>
          {order.user.street} {order.user.houseNumber}
        </p>
        <p>
          {order.user.city}, {order.user.state} {order.user.postalCode}
        </p>
        <p>{order.user.countryCode}</p>
      </div>

      {/* User Info */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold border-b border-gray-700 pb-2">
          User Info
        </h2>
        <p>
          <span className="font-semibold">Name:</span> {order.user.name}
        </p>
      </div>
    </section>
  );
}

export default OrderSummary;
