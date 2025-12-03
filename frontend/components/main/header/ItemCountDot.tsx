function ItemCountDot({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="absolute bg-red-500 rounded-full w-7 p-2 h-7 flex justify-center items-center -top-4 -right-4">
      {count > 99 ? "99+" : count}
    </div>
  );
}

export default ItemCountDot;
