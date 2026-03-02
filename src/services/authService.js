import api from '@/lib/axios';

export const sendOtp = async (email) => {
    try {
        const res = await api.post('/auth/send-otp', { email });
        return res.data;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error(error.response.data.message);
    }

};

export const signUp = async ({ name, email, password, otp }) => {
    try {
        const res = await api.post('/auth/signup', {
            name,
            email,
            password,
            otp,
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response.data.message);

    }
};
