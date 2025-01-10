import { useCallback, useState, useEffect, useMemo } from "react";
import { ApprovalResponse, ApprovalStatus } from "../types/ApprovalRequest";
import { Pagination } from "./Pagination";
import { useStorage } from "../storage/storage";
import Toast from "./Toast";
import Loading from "./Loading";
import { approveApproval, getAllApprovals, rejectApproval } from "../api/rest/approval";
import { FaCheck, FaTimes } from "react-icons/fa";
import { createAdminApprovalWebSocket } from "../api/ws/approvalWS";

const ApprovalList = () => {
  const [approvals, setApprovals] = useState<ApprovalResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);

  const { token } = useStorage();

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const response = await getAllApprovals(
      token,
      currentPage - 1,
      pageSize,
      "id",
      "asc"
    );
    if (response.status === 200) {
      const { content, totalPages } = response.data;
      setApprovals(content);
      setTotalPages(totalPages);
    } else {
      setToast({
        message: response.data.message || "Ошибка при получении заявок",
        type: "error"
      });
    }
    setIsLoading(false);
  }, [currentPage, pageSize, token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, currentPage, pageSize]);

  const handleApprove = async (id: number) => {
    const response = await approveApproval(token, id);
    if (response.status === 200) {
      setToast({
        message: "Заявка одобрена успешно!",
        type: "success"
      });
      fetchRequests();
    } else {
      setToast({
        message: response.data.message || "Ошибка при одобрении заявки",
        type: "error"
      });
    }
  };

  const handleReject = async (id: number) => {
    const response = await rejectApproval(token, id);
    if (response.status === 200) {
      setToast({
        message: "Заявка отклонена",
        type: "success"
      });
      fetchRequests();
    } else {
      setToast({
        message: response.data.message || "Ошибка при отклонении заявки",
        type: "error"
      });
    }
  };

  const getStatusText = (status: ApprovalStatus): string => {
    switch (status) {
      case ApprovalStatus.SENT:
        return "Ожидает";
      case ApprovalStatus.APPROVED:
        return "Одобрено";
      case ApprovalStatus.REJECTED:
        return "Отклонено";
      default:
        return "";
    }
  };

  const filteredApprovalRequests = useMemo(() => {
    return approvals.filter((ar) => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          ar.id.toString().includes(searchLower) ||
          ar.user.username.toLowerCase().includes(searchLower) ||
          new Date(ar.createdAt).toLocaleString().toLowerCase().includes(searchLower) ||
          (ar.statusChangedBy?.username || "").toLowerCase().includes(searchLower) ||
          getStatusText(ar.status as ApprovalStatus).toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [approvals, searchQuery]);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  // WebSocket handlers
  const handleApprovalUpdate = useCallback((updatedApproval: ApprovalResponse) => {
    setApprovals(prevApprovals =>
      prevApprovals.map(approval =>
        approval.id === updatedApproval.id ? updatedApproval : approval
      )
    );
    setToast({
      message: "Статус заявки обновлен",
      type: "success"
    });
  }, []);

  const handleApprovalCreate = useCallback((newApproval: ApprovalResponse) => {
    setApprovals(prevApprovals => [...prevApprovals, newApproval]);
    setToast({
      message: "Получена новая заявка",
      type: "success"
    });
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const client = createAdminApprovalWebSocket(
      handleApprovalUpdate,
      handleApprovalCreate
    );

    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [handleApprovalUpdate, handleApprovalCreate]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative font-sans">
      <div className="w-full max-w-8xl space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">
          Список запросов
        </h1>

        <div className="bg-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
          <div className="flex justify-between items-center w-full">
            <input
              type="text"
              placeholder="Поиск по всем полям..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            {isLoading ? (
              <Loading />
            ) : (
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium">ID</span>
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium">Пользователь</span>
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium">Дата</span>
                      </div>
                    </th>
                    <th>
                      <div className="flex flex-col items-center">
                        <span className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium">Администратор</span>
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className="cursor-pointer hover:text-blue-600 text-gray-600 font-medium">Статус</span>
                      </div>
                    </th>
                    <th className="p-3 min-w-24">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApprovalRequests.map((ar) => (
                    <tr key={ar.id} className="border-b border-gray-200 hover:bg-gray-100 text-center h-16">
                      <td className="p-3">{ar.id}</td>
                      <td className="p-3">{ar.user.username}</td>
                      <td className="p-3">{new Date(ar.createdAt).toLocaleString()}</td>
                      <td className="p-3">{ar.statusChangedBy?.username || ""}</td>
                      <td className={`font-medium ${ar.status === ApprovalStatus.SENT ? "text-yellow-600" :
                          ar.status === ApprovalStatus.APPROVED ? "text-green-600" :
                            "text-red-600"
                        }`}>
                        {getStatusText(ar.status as ApprovalStatus)}
                      </td>
                      <td className="p-3">
                        {ar.status === ApprovalStatus.SENT && (
                          <div className="flex gap-2 justify-center">
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md text-sm font-medium transition-colors duration-300"
                              onClick={() => handleApprove(ar.id)}
                              title="Одобрить"
                            >
                              <FaCheck size={16} />
                            </button>
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md text-sm font-medium transition-colors duration-300"
                              onClick={() => handleReject(ar.id)}
                              title="Отклонить"
                            >
                              <FaTimes size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
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

export default ApprovalList;
