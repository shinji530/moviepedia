import { useEffect, useRef, useState } from "react";

export default function FileInput({ name, value, initialPreview, onChange }) {
  const [preview, setPreview] = useState(initialPreview);
  const inputRef = useRef();

  const handleChange = (e) => {
    const nextValue = e.target.files[0];
    onChange(name, nextValue);
  };

  const handleClearClick = () => {
    const inputFileNode = inputRef.current;
    if (!inputFileNode) return;

    inputFileNode.value = "";
    onChange(name, null);
  };

  useEffect(() => {
    if (!value) return;
    const nextPreview = URL.createObjectURL(value);
    setPreview(nextPreview);

    return () => {
      setPreview(initialPreview);
      URL.revokeObjectURL(nextPreview);
    };
  }, [value, initialPreview]);

  return (
    <div>
      <img src={preview} alt="이미지 미리보기" />
      <input accept="image/+" ref={inputRef} type="file" onChange={handleChange} />
      {value && <button onClick={handleClearClick}>업로드 취소</button>}
    </div>
  );
}
