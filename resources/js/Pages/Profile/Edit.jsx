import React, { useState } from 'react';
import { FormWrapper, Label, Input, Button } from '../../components';
import { Inertia } from '@inertiajs/inertia';
import useIsMobile from '@/utils/useIsMobile';

const ProfileForm = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const isMobile = useIsMobile();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setProcessing(true);

    Inertia.post('/profile/update', formData, {
      onError: (errorResponse) => {
        setErrors(errorResponse);
        setProcessing(false);
      },
      onSuccess: () => {
        setProcessing(false);
      },
    });
  };


  return (
    <div className="container mx-auto">
      <div className="mx-4 my-6 sm:mx-10 sm:my-10">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Edit Profile</h1>

        <FormWrapper onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <Label htmlFor="name" required>
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Your Name"
              error={errors.name}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Your Email"
              error={errors.email}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <Label htmlFor="password">
              Password{' '}
              <span className="text-xs text-gray-500">
                (Leave blank to keep current password)
              </span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="New Password"
              error={errors.password}
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <Label htmlFor="password_confirmation">Confirm Password</Label>
            <Input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm New Password"
              error={errors.password_confirmation}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={() => Inertia.visit('/dashboard')}
              variant="secondary"
              disabled={processing}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={processing}>
              {processing ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </FormWrapper>
      </div>
    </div>
  );
};

export default ProfileForm;
