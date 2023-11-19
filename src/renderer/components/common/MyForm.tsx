import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import 'react-datepicker/dist/react-datepicker.css';

interface FormValues {
  email: string;
  password: string;
  transactionDate: Date; // 날짜 필드 추가
}

// 유효성 검사 스키마
const validationSchema = Yup.object({
  email: Yup.string().email('유효한 이메일 주소를 입력하세요').required('이메일은 필수 항목입니다'),
  password: Yup.string().required('비밀번호는 필수 항목입니다'),
  transactionDate: Yup.date().required('날짜는 필수 항목입니다'), // 날짜 필드에 대한 유효성 검사 추가
});

function MyForm() {
  const {
    register,
    control, // Controller 사용을 위해 control 추가
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: {
      email: 'example@example.com', // 초기 이메일 값 설정
      password: '', // 비밀번호는 초기값 없음
      transactionDate: new Date(), // 초기 날짜 값 설정
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">이메일</label>
        <input {...register('email')} type="email" />
        {errors.email && <div>{errors.email.message}</div>}
      </div>

      <div>
        <label htmlFor="password">비밀번호</label>
        <input {...register('password')} type="password" />
        {errors.password && <div>{errors.password.message}</div>}
      </div>

      <div>
        <label htmlFor="transactionDate">날짜</label>
        <Controller
          control={control}
          name="transactionDate"
          render={({ field }) => <DatePicker dateFormat="yyyy-MM-dd" className="form-control" onChange={field.onChange} selected={field.value} />}
        />
        {errors.transactionDate && <div>{errors.transactionDate.message}</div>}
      </div>

      <button type="submit">제출</button>
    </form>
  );
}

export default MyForm;
