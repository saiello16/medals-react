function Medal({ medalType, count, onIncrement, onDecrement }) {
  return (
    <div className="medal">
      <span>{medalType} medals:</span>
      <button onClick={onDecrement} disabled={count === 0}>-</button>
      <span>{count}</span>
      <button onClick={onIncrement}>+</button>
    </div>
  );
}

export default Medal;
