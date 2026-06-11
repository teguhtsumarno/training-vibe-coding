"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Employee } from "@/types/employee";
import * as employeeStorage from "@/services/employee-storage";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    const data = await employeeStorage.getAllEmployees();
    setEmployees(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const addEmployee = useCallback(
    async (data: Omit<Employee, "id">): Promise<Employee> => {
      const newEmployee = await employeeStorage.createEmployee(data);
      loadEmployees();
      return newEmployee;
    },
    [loadEmployees]
  );

  const editEmployee = useCallback(
    async (id: string, data: Partial<Employee>): Promise<Employee> => {
      const updated = await employeeStorage.updateEmployee(id, data);
      loadEmployees();
      return updated;
    },
    [loadEmployees]
  );

  const removeEmployee = useCallback(
    async (id: string): Promise<void> => {
      await employeeStorage.deleteEmployee(id);
      loadEmployees();
    },
    [loadEmployees]
  );

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const lowerQuery = searchQuery.toLowerCase();
    return employees.filter((employee) =>
      employee.name.toLowerCase().includes(lowerQuery)
    );
  }, [employees, searchQuery]);

  return {
    employees,
    filteredEmployees,
    searchQuery,
    isLoading,
    loadEmployees,
    addEmployee,
    editEmployee,
    removeEmployee,
    setSearchQuery,
  };
}
