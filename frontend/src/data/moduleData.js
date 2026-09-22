import {
  Users,
  FileText,
  UserRound,
  GraduationCap,
  User,
  UsersRound,
  IndianRupee,
  ListTodo,
  MessageSquare,
  UserPlus,
  CalendarCheck,
  ClipboardList,
  Megaphone,
  Bell,
  UserCheck,
} from "lucide-react";

export const modules = [
  {
    title: "Customers",
    icon: Users,
    path: "/customers",
  },
  {
    title: "Invoices",
    icon: FileText,
    path: "/invoices",
  },
    {
    title: "Accounts",
    icon: IndianRupee,
    path: "/accounts/voucher",
  },
     {
    title: "Announcement",
    icon: Megaphone,
    path: "/announcements",
  },

  {
  title: "Notification",
  icon: Bell,
  path: "/notifications",
},
  {
    title: "New Joining",
    icon: UserCheck,
    path: "/joining-candidates",
  },
  {
    title: "Employees",
    icon: UserRound,
    path: "/employees",
  },
  {
    title: "Students",
    icon: GraduationCap,
    path: "/students",
  },
  {
    title: "Users",
    icon: User,
    path: "/users",
  },
  {
    title: "Teams",
    icon: UsersRound,
    path: "/teams",
  },

  {
    title: "Tasks",
    icon: ListTodo,
    path: "/tasks",
  },
  {
    title: "Interview",
    icon: MessageSquare,
    path: "/interview",
  },  
  {
    title: "Attendance",
    icon: CalendarCheck,
    path: "/attendance",
  },
  {
    title: "Leave",
    icon: ClipboardList,
    path: "/leave",
  },
 
];
