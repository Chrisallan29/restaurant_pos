import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen} from '@testing-library/react';
import LoginForm from '../scenes/LoginForm/LoginForm';
import { BrowserRouter } from 'react-router-dom';
import { waitFor } from '@testing-library/react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  getAuth: jest.fn(),

}));

const MockLoginForm = () => {
  return (
    <BrowserRouter>
      <LoginForm/>
    </BrowserRouter>
  )
}

describe("LoginForm Test", () => {
  describe("Filling In:", ()=> {
    const fillInAndSubmitLogin = (email, password, button) => {
      const emailInput = screen.getByPlaceholderText('Login Email');
      const passwordInput = screen.getByPlaceholderText('Login Password');
      fireEvent.change(emailInput, {target : {value : email}});
      fireEvent.change(passwordInput, {target: {value: password}});
      fireEvent.click(button);
    }
    test("invalid credentials", () => {
      const mockError = {
        code: 'auth/invalid-credential',
        message: 'Invalid Credentials',
      };
      render(<MockLoginForm error={mockError} />); // Pass the mocked error
      render(<MockLoginForm/>);
      const loginButton = screen.getByRole('button', {name: 'Login'});

      //Incorrect Password
      fillInAndSubmitLogin('chrisallan29@gmail.com', 'incorrect-password', loginButton);

      const errorPopUp = screen.getByTestId('popup-notification')
      expect(errorPopUp).toBeInTheDocument();
      //expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    })
  })
})

// jest.mock('firebase/auth', () => ({
//   signInWithEmailAndPassword: jest.fn(),
//   createUserWithEmailAndPassword: jest.fn(),
//   getAuth: jest.fn(), // Used in successful registration test
// }));

// jest.mock('react-router-dom', () => ({
//   //useNavigate: jest.fn(),
// }));

// test('test', async() => {
//     const emailInput = screen.getByPlaceholderText('Login Email');
//     const passwordInput = screen.getByPlaceholderText('Login Password');
//     const loginButton = screen.getByRole('button', { name: /Login/i });

//     fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
//     fireEvent.change(passwordInput, { target: { value: 'secret123' } });
//     expect(emailInput).toBeInTheDocument();
// })

// describe('LoginForm component', () => {
//   test('successful login redirects to first-setup', async () => {
//     const navigate = jest.fn();
//     React.act( () => {
//         render(<LoginForm />);
//     })

//     const emailInput = screen.getByPlaceholderText('Login Email');
//     const passwordInput = screen.getByPlaceholderText('Login Password');
//     const loginButton = screen.getByRole('button', { name: /Login/i });

//     fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
//     fireEvent.change(passwordInput, { target: { value: 'secret123' } });

//     await React.act(async () => {
//       fireEvent.click(loginButton);
//       await waitFor(() => expect(navigate).toHaveBeenCalledWith('/first-setup'));
//     });
//   });

//   test('login with invalid credentials shows error message', async () => {
//     const mockError = new Error('FirebaseError: Invalid email or password.');
//     mockError.code = 'auth/invalid-credentials';
//     jest.mock('firebase/auth', () => ({
//       signInWithEmailAndPassword: jest.fn(() => Promise.reject(mockError)),
//       createUserWithEmailAndPassword: jest.fn(), // Mocked but not used in this test
//       getDoc: jest.fn(), // Mocked but not used in this test
//       updateDoc: jest.fn(), // Mocked but not used in this test
//     }));

//     render(<LoginForm />);

//     const emailInput = screen.getByPlaceholderText('Login Email');
//     const passwordInput = screen.getByPlaceholderText('Login Password');
//     const loginButton = screen.getByRole('button', { name: /Login/i });

//     fireEvent.change(emailInput, { target: { value: 'invalid@email.com' } });
//     fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

//     await React.act(async () => {
//       fireEvent.click(loginButton);
//       const errorMessage = await screen.findByText(/Invalid Credentials. You may not have created an account or the entered password is incorrect/i);
//       expect(errorMessage).toBeInTheDocument();
//     });
//   });
// });


  // Register Tests
//   test('successful registration redirects to first-setup page', async () => {
//     const navigate = jest.fn();
//     const mockUser = { uid: 'test-user-id' };
//     jest.mock('firebase/auth', () => ({
//       signInWithEmailAndPassword: jest.fn(), // Mocked but not used in this test
//       createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: mockUser })),
//       getDoc: jest.fn(() => Promise.resolve({ exists: false })), // Simulate no existing user data
//       updateDoc: jest.fn(), // Mocked but not used in this test
//     }));

//     render(<LoginForm />);

//     const registerLink = screen.getByText(/Go to Register Page/i);
//     fireEvent.click(registerLink);

//     const emailInput = screen.getByPlaceholderText('Register Email');
//     const passwordInput = screen.getByPlaceholderText('Register Password');
//     const registerButton = screen.getByRole('button', { name: /Register/i });

//     fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
//     fireEvent.change(passwordInput, { target: { value: 'securepassword' } });
//     await act(async () => fireEvent.click(registerButton));

//     expect(navigate).toHaveBeenCalledWith('/first-setup');
//   });

//   test('successful registration redirects to first-setup page', async () => {
//     const navigate = jest.fn();
//     jest.mock('firebase/auth', () => ({
//       signInWithEmailAndPassword: jest.fn(), // Mocked but not used in this test
//       createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-user-id' } })),
//       getDoc: jest.fn(() => Promise.resolve({ exists: false })), // Simulate no existing user data
//       updateDoc: jest.fn(), // Mocked but not used in this test
//     }));
  
//     render(<LoginForm />);
  
//     const registerLink = screen.getByText(/Go to Register Page/i);
//     fireEvent.click(registerLink);
  
//     const emailInput = screen.getByPlaceholderText('Register Email');
//     const passwordInput = screen.getByPlaceholderText('Register Password');
//     const registerButton = screen.getByRole('button', { name: /Register/i });
  
//     fireEvent.change(emailInput, { target: { value: 'alreadyused@example.com' } });
//     fireEvent.change(passwordInput, { target: { value: 'anotherpassword' } });
//     await act(async () => fireEvent.click(registerButton));
  
//     const errorMessage = await screen.findByText(/The email address is already in use/i);
//     expect(errorMessage).toBeInTheDocument();
//   });

