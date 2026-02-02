import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { client } from "@/services/api";
import {
  type Field,
  type CreateField,
  type UpdateField,
  type FieldType,
} from "../../../backend/src/types/fields";
import { AxiosError } from "axios";

export type { Field, CreateField, UpdateField, FieldType };

const fieldKeys = {
  all: ["fields"] as const,
  list: (formId: string) => [...fieldKeys.all, "list", formId] as const,
};

const listFields = async (formId: string) => {
  const res = await client.get<Field[]>(`/forms/${formId}/fields`);
  return res.data;
};

const createField = async (formId: string, payload: CreateField) => {
  const res = await client.post<Field>(`/forms/${formId}/fields`, payload);
  return res.data;
};

const updateField = async (
  formId: string,
  fieldId: string,
  payload: UpdateField,
) => {
  const res = await client.patch<Field>(
    `/forms/${formId}/fields/${fieldId}`,
    payload,
  );
  return res.data;
};

const deleteField = async (formId: string, fieldId: string) => {
  const res = await client.delete<{ success: boolean }>(
    `/forms/${formId}/fields/${fieldId}`,
  );
  return res.data;
};

const reorderFields = async (formId: string, fieldOrder: string[]) => {
  const res = await client.put<Field[]>(`/forms/${formId}/fields/reorder`, {
    fieldOrder,
  });
  return res.data;
};

export const useFields = (formId: string) =>
  useQuery({
    queryKey: fieldKeys.list(formId),
    queryFn: () => listFields(formId),
    enabled: Boolean(formId),
  });

export const useCreateField = (formId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Field, AxiosError, CreateField>({
    mutationFn: (payload) => createField(formId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.list(formId) });
    },
  });
};

export const useUpdateField = (formId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Field, AxiosError, { fieldId: string; payload: UpdateField }>({
    mutationFn: ({ fieldId, payload }) => updateField(formId, fieldId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.list(formId) });
    },
  });
};

export const useDeleteField = (formId: string) => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, AxiosError, string>({
    mutationFn: (fieldId) => deleteField(formId, fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.list(formId) });
    },
  });
};

export const useReorderFields = (formId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Field[], AxiosError, string[]>({
    mutationFn: (fieldOrder) => reorderFields(formId, fieldOrder),
    onSuccess: (fields) => {
      queryClient.setQueryData(fieldKeys.list(formId), fields);
    },
  });
};

export { fieldKeys };
