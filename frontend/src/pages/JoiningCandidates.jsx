import JoiningCandidateTable from "../components/joining/JoiningCandidateTable";

const JoiningCandidates = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          New Joining 
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View New joining records
        </p>
      </div>

      <JoiningCandidateTable />
    </div>
  );
};

export default JoiningCandidates;