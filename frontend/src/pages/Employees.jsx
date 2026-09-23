import React from "react";
import EmployeeTable from "../components/employee/EmployeeTable";

const Employees = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-deem-blue">
          Employees
        </h1>
 
      </div>

      <EmployeeTable />
    </div>
  );
};

export default Employees;