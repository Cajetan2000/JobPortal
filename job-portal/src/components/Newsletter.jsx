import React from 'react';
import { FaEnvelopeOpenText, FaRocket } from 'react-icons/fa6';
import ResumeBuilder from './ResumeBuilder';

const Newsletter = () => {
  return (
    <div>
      <div>
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <FaEnvelopeOpenText /> Email me for jobs
        </h3>
        <p className="text-primary/75 text-base mb-4">
          Exprience is important. You cant become a master in anything without practicing it.
        </p>
        <div className="w-full space-y-4">
          <input
            type="email"
            placeholder="name@mail.com"
            className="w-full block py-2 pl-3 border focus:outline-none"
          />
          <input
            type="submit"
            value="Subscribe"
            className="w-full block py-2 bg-blue rounded-sm text-white cursor-pointer font-semibold"
          />
        </div>
      </div>

      {/* 2nd section */}
      <div className="mt-20">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <FaRocket /> Get noticed faster
        </h3>
        <p className="text-primary/75 text-base mb-4">
          Get feedback on your resume.
        </p>
        <ResumeBuilder />
      </div>
    </div>
  );
};

export default Newsletter;
