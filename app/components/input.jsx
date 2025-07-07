//file: app/components/input.jsx
"use client"
import styles from './input.module.scss';






const Input = ({ label, name, type, value, onChange, onBlur, error, touched }) => {
  return (
    <div className={styles.inputContainer}>
      <label htmlFor={name} className={styles.label}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${styles.input} ${error && touched ? styles.error : ''}`}
      />
      {error && touched && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default Input;