"use client";

type Props = {
  children: React.ReactNode;
  confirmMessage: string;
  className?: string;
};

export function ConfirmSubmitButton({ children, confirmMessage, className }: Props) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      className={className}
    >
      {children}
    </button>
  );
}
