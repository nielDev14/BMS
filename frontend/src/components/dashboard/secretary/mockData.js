export const mockIncidentReports = [
    {
        id: 1,
        category: "Crime-Related Incidents",
        subCategory: "Theft/Burglary",
        date: "2023-06-01",
        time: "14:30",
        location: "123 Main St",
        description: "Laptop stolen from parked car",
        reporterName: "John Doe",
        reporterContact: "john@example.com",
        status: "New",
    },
    {
        id: 2,
        category: "Community Disturbances",
        subCategory: "Noise Complaints",
        date: "2023-06-02",
        time: "22:00",
        location: "456 Elm St",
        description: "Loud party past midnight",
        reporterName: "Jane Smith",
        reporterContact: "555-1234",
        status: "In Progress",
    },
    {
        id: 3,
        category: "Environmental & Health Concerns",
        subCategory: "Garbage Dumping",
        date: "2023-06-03",
        time: "09:15",
        location: "789 Oak Ave",
        description: "Illegal dumping in vacant lot",
        reporterName: "Bob Johnson",
        reporterContact: "bob@example.com",
        status: "Resolved",
    },
    // Add more mock data as needed
];

export const mockDocumentRequests = [
    {
        id: 1,
        type: "Barangay Clearance",
        requestDate: "2023-06-01",
        residentName: "John Doe",
        purpose: "Job Application",
        status: "Pending",
    },
    {
        id: 2,
        type: "Barangay Indigency",
        requestDate: "2023-06-02",
        residentName: "Jane Smith",
        purpose: "Medical Assistance",
        status: "Approved",
    },
    {
        id: 3,
        type: "Cedula",
        requestDate: "2023-06-03",
        residentName: "Bob Johnson",
        purpose: "Business Permit",
        status: "Completed",
    },
    {
        id: 4,
        type: "Barangay Business Clearance",
        requestDate: "2023-06-04",
        residentName: "Alice Brown",
        purpose: "New Business Registration",
        status: "Pending",
    },
    // Add more mock data as needed
];

export const mockResidents = [
    {
        id: 1,
        name: "John Doe",
        age: 35,
        address: "123 Main St, Barangay Centro",
        contactNumber: "123-456-7890",
        occupation: "Teacher",
        familyMembers: 4,
        dateRegistered: "2022-01-15",
        profileImage: "/placeholder.svg?height=100&width=100",
    },
    {
        id: 2,
        name: "Jane Smith",
        age: 28,
        address: "456 Elm St, Barangay Norte",
        contactNumber: "987-654-3210",
        occupation: "Nurse",
        familyMembers: 2,
        dateRegistered: "2022-03-22",
        profileImage: "/placeholder.svg?height=100&width=100",
    },
    {
        id: 3,
        name: "Bob Johnson",
        age: 45,
        address: "789 Oak Ave, Barangay Sur",
        contactNumber: "456-789-0123",
        occupation: "Business Owner",
        familyMembers: 5,
        dateRegistered: "2021-11-30",
        profileImage: "/placeholder.svg?height=100&width=100",
    },
    {
        id: 4,
        name: "Alice Brown",
        age: 52,
        address: "101 Pine Rd, Barangay Este",
        contactNumber: "789-012-3456",
        occupation: "Accountant",
        familyMembers: 3,
        dateRegistered: "2022-05-10",
        profileImage: "/placeholder.svg?height=100&width=100",
    },
    {
        id: 5,
        name: "Charlie Davis",
        age: 30,
        address: "202 Cedar Ln, Barangay Oeste",
        contactNumber: "321-654-9870",
        occupation: "Engineer",
        familyMembers: 1,
        dateRegistered: "2022-07-05",
        profileImage: "/placeholder.svg?height=100&width=100",
    },
];

// Mock data for testing
export const mockRequests = [
    {
        id: 1,
        documentType: "Barangay Clearance",
        status: "pending",
        createdAt: "2024-03-15",
        purpose: "Job Application",
    },
    {
        id: 2,
        documentType: "Barangay Indigency",
        status: "approved",
        createdAt: "2024-03-10",
        purpose: "Medical Assistance",
    },
    {
        id: 3,
        documentType: "Cedula",
        status: "rejected",
        createdAt: "2024-03-05",
        purpose: "Business Permit",
    },
    {
        id: 4,
        documentType: "Barangay Business Clearance",
        status: "approved",
        createdAt: "2024-03-01",
        purpose: "Business Registration",
    },
];
