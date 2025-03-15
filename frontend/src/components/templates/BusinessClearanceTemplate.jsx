import GASAN_LOGO from "../../assets/gasan-logo.png";
import PHILIPPINES_LOGO from "../../assets/ph-logo.png";

export const generateBusinessClearanceTemplate = (document, currentUser) => {
    // Get the chairman's name from the passed data
    const chairmanName = currentUser?.barangayCaptain || "[BARANGAY CAPTAIN NAME]";
    const currentDate = new Date();

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Business Clearance - ${document.businessName}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        fontFamily: {
                            serif: ['Times New Roman', 'serif'],
                        }
                    }
                }
            };
        </script>
        <style>
            @page {
                size: letter;
                margin: 0;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                }
            }
            .border-pattern {
                border: 2px solid #000;
                border-radius: 5px;
                position: relative;
                background: white;
            }
            .border-pattern::before {
                content: '';
                border: 2px solid #000;
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                bottom: 0.5rem;
                left: 0.5rem;
                border-radius: 3px;
            }
        </style>
    </head>
    <body class="font-serif m-0 p-0 text-black flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-[8.5in] h-[11in] mx-auto p-6 bg-white shadow-lg border-pattern">
            <div class="relative z-10 h-full px-8 py-4 flex flex-col items-center">
                <!-- Header Section -->
                <div class="flex justify-center items-center space-x-12 mb-3">
                    <img src="${PHILIPPINES_LOGO}" 
                         alt="Philippine Logo" 
                         class="w-20 h-20 object-contain"
                    >
                    <div class="text-center space-y-0.5">
                        <p class="text-base font-semibold">Republic of the Philippines</p>
                        <p class="text-base font-semibold">Province of Marinduque</p>
                        <p class="text-base font-semibold">Municipality of Gasan</p>
                    </div>
                    <img src="${GASAN_LOGO}" 
                         alt="Gasan Logo" 
                         class="w-20 h-20 object-contain"
                    >
                </div>

                <!-- Title Section -->
                <div class="space-y-1 mb-6">
                    <div class="text-center">
                        <p class="text-2xl font-bold tracking-wide uppercase">BARANGAY ${document.barangay.toUpperCase()}</p>
                    </div>
                    <div class="text-center">
                        <p class="italic text-lg uppercase">OFFICE OF THE PUNONG BARANGAY</p>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="flex-1 w-full max-w-3xl">
                    <div class="space-y-4">
                        <p class="text-left font-semibold text-lg">TO WHOM IT MAY CONCERN:</p>

                        <p class="text-justify leading-relaxed">
                            This is to certify Business or Trade activity described below:
                        </p>

                        <div class="space-y-6 text-center mx-auto" style="max-width: 600px;">
                            <div class="mb-6">
                                <p class="font-bold text-xl underline">${document.businessName}</p>
                                <p class="text-sm mt-1">Business Name</p>
                            </div>

                            <div class="mb-6">
                                <p class="font-bold text-xl underline">Purok ${document.businessLocation}</p>
                                <p class="text-sm mt-1">Location of Business</p>
                            </div>

                            <div class="mb-6">
                                <p class="font-bold text-xl underline">${document.operatorManager}</p>
                                <p class="text-sm mt-1">Operator/Manager</p>
                            </div>
                        </div>

                        <p class="text-justify leading-relaxed">
                            Being applied for the issuance of <span class="font-bold">${document.purpose}</span> of corresponding Mayor's Permit and has been found to be:
                        </p>

                        <div class="space-y-3">
                            <p class="text-justify leading-relaxed">
                                That the Business or Trade complied with the provision of existing Barangay Ordinance, Rules and Regulations enforced in this barangay;
                            </p>

                            <p class="text-justify leading-relaxed">
                                That the business or trade partially applies with the provision of the existing Barangay Ordinance, Rules and Regulations enforced in this barangay;
                            </p>
                        </div>

                        <p class="text-justify leading-relaxed">
                            In view of the foregoing, this barangay thru the undersigned;
                        </p>

                        <div class="space-y-3">
                            <p class="text-justify leading-relaxed">
                                Interpose no objections for the issuance of the corresponding Mayor's Permit being applied for
                            </p>

                            <p class="text-justify leading-relaxed">
                                Recommends only the issuance of Mayor's Permit for not more than three (3) months within that period requirement under the provisions of existing rules and regulations on that matter would take that necessary actions within the legal bounds to stop its operations
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Footer Section -->
                <div class="w-full mt-6 flex justify-between items-end">
                    <div class="space-y-0.5">
                        <p>OR #: ${document.orNumber || "_____________"}</p>
                        <p>Fees: ₱100.00</p>
                        <p>Date: ${currentDate.toLocaleDateString()}</p>
                    </div>
                    <div class="text-center">
                        <div class="border-t-2 border-black pt-1 px-16">
                            <p class="font-bold uppercase mb-0.5 text-lg">${chairmanName}</p>
                            <p class="uppercase text-sm">Punong Barangay</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script>
            window.onload = function() {
                window.print();
            };
        </script>
    </body>
    </html>`;
};
