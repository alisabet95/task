//file: app/comoonents/buttpn.jsx
"use client"
import styles from './button.module.scss';


const Button = ({ children, type = 'button', disabled, onClick }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={styles.button}
    >
      {children}
    </button>
  );
};

export default Button;