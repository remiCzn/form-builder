import {
  useMutation as useMutationBase,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { client } from "@/services/api";
import {
  type Form,
  type CreateForm,
  type UpdateForm,
} from "../../../backend/src/types/forms";
import { AxiosError } from "axios";

function useMutation<TData, TVariables>(
  options: UseMutationOptions<TData, AxiosError, TVariables>,
) {
  return useMutationBase(options);
}

const formKeys = {
  all: ["forms"] as const,
  list: () => [...formKeys.all, "list"] as const,
  detail: (id: string) => [...formKeys.all, "detail", id] as const,
};

const listForms = async () => {
  const res = await client.get<Form[]>("/forms");
  return res.data;
};

const getForm = async (id: string) => {
  const res = await client.get<Form>(`/forms/${id}`);
  return res.data;
};

const createForm = async (payload: CreateForm) => {
  const res = await client.post<Form>("/forms", payload);
  return res.data;
};

const updateForm = async (id: string, payload: UpdateForm) => {
  const res = await client.patch<Form>(`/forms/${id}`, payload);
  return res.data;
};

const publishForm = async (id: string) => {
  const res = await client.post<Form>(`/forms/${id}/publish`);
  return res.data;
};

export const useForms = () =>
  useQuery({
    queryKey: formKeys.list(),
    queryFn: listForms,
  });

export const useForm = (id: string) =>
  useQuery({
    queryKey: formKeys.detail(id),
    queryFn: () => getForm(id),
    enabled: Boolean(id),
  });

export const useCreateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createForm,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: formKeys.list() });
      queryClient.setQueryData(formKeys.detail(created.id), created);
    },
  });
};

export const useUpdateForm = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateForm) => updateForm(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: formKeys.list() });
      queryClient.setQueryData(formKeys.detail(updated.id), updated);
    },
  });
};

export const usePublishForm = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => publishForm(id),
    onSuccess: (published) => {
      queryClient.invalidateQueries({ queryKey: formKeys.list() });
      queryClient.setQueryData(formKeys.detail(published.id), published);
    },
  });
};

export { formKeys };
