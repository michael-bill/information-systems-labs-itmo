import { useState } from "react";
import { useStorage } from "../../storage/storage";
import { Role } from "../../types/Roles";
import ApprovalList from "../ApprovalList";
import Toast from "../Toast";
import { createApproval, getMyApprovals } from "../../api/rest/approval";
import { ApprovalResponse } from "../../types/ApprovalRequest";
import { ApprovalStatus } from "../../types/ApprovalRequest";

const Admin = () => {
  const { getRole, token } = useStorage();
  const role = getRole();

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleSubmitApproval = async () => {
    const response = await createApproval(token);
    if (response.status === 200) {
      setToast({
        message: "Заявка на вступление в состав администрации принята.",
        type: "success"
      });
    } else {
      console.log(response);
      setToast({
        message: response.data.message,
        type: "error"
      });
    }
  };

  const handleCheckApprovalStatus = async () => {
    const response = await getMyApprovals(token);
    if (response.status === 200) {
      const {content} = response.data;
      // If any request is approved, show success toast
      if (content.some((ar: ApprovalResponse) => ar.status === ApprovalStatus.APPROVED)) {
        setToast({
          message: "Ваша заявка на вступление в состав администрации одобрена. Перезайдите в приложение.",
          type: "success"
        });
      } else {
        setToast({
          message: "Ваша заявка на вступление в состав администрации не одобрена.",
          type: "error"
        });
      }
    } else {
      setToast({
        message: "Не удалось проверить статус заявки: " + response.data.message,
        type: "error"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center relative font-sans">
      <div className="w-full max-w-8xl space-y-6">
        <div>
          {role === Role.ADMIN ? (
            <ApprovalList />
          ) : (
            <div className="min-h-screen flex flex-col items-center p-4 relative font-sans space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">
                У вас нет прав администратора.
              </h1>

              <div className="flex flex-col w-full max-w-md space-y-4">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300"
                  onClick={handleSubmitApproval}
                >
                  Запросить права администратора
                </button>

                <button
                  onClick={handleCheckApprovalStatus}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-300"
                >
                  Проверить статус заявки
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Admin;