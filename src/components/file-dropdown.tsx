import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";
import { mkExpenseRecords } from "~/utils/process-sheet";
import { joinItauRediva } from "~/utils/process-sheet/join-itau-rediva";
import { writeExpensesToDB } from "~/utils/storage";
import { useQueryClient } from "@tanstack/react-query";

const useProcessUploadedFiles = () => {
  const queryClient = useQueryClient();

  return async (files: File[]) => {
    const records = (
      await Promise.all(
        files.map(async (file) => {
          return mkExpenseRecords(await file.arrayBuffer(), file.name);
        }),
      )
    ).flat();
    const recordsWithJoinedRediva = joinItauRediva(records);
    await writeExpensesToDB(recordsWithJoinedRediva);
    await queryClient.invalidateQueries({
      queryKey: ["expenses"],
    });
  };
};

export const FileDropdown = () => {
  const onFilesUploaded = useProcessUploadedFiles();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      void onFilesUploaded(acceptedFiles);
    },
    [onFilesUploaded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-all duration-300 ${
          isDragActive
            ? "scale-105 border-red-200 bg-primary/10"
            : "hover:scale-102 border-white bg-white/10 backdrop-blur-xl hover:border-red-200 hover:bg-white/20"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-4 h-12 w-12 text-white" />
        <p className="mb-2 text-lg font-semibold text-gray-700">
          {isDragActive
            ? "Suelta los archivos aquí..."
            : "Arrastra tus estados de cuenta aquí"}
        </p>
        <p className="text-sm text-gray-600">o haz click para seleccionar</p>
      </div>
    </motion.div>
  );
};
