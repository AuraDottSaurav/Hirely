'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Candidate } from "@prisma/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo, useEffect } from "react";
import { FileText, Briefcase, Mail, Filter, CheckCircle2, XCircle, ExternalLink, FileIcon, Calendar, RefreshCw, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { approveCandidate, rejectCandidate } from "@/app/actions/application";
import { checkCandidateBooking, isCalendarConnected } from "@/app/actions/calendar";
import { SlotPicker } from "./slot-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function CandidatesTable({ candidates }: { candidates: Candidate[] }) {
    const router = useRouter();
    const [selectedSlots, setSelectedSlots] = useState<Date[]>([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [meetingLink, setMeetingLink] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        isCalendarConnected().then(setIsConnected);
    }, []);

    // Fix hydration mismatch for Select component
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-refresh every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 5000);
        return () => clearInterval(interval);
    }, [router]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        toast.success("Refreshing candidates...");
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleConnectCalendar = () => {
        window.location.href = "/api/oauth/google";
    };

    const handleCheckBooking = async (candidateId: string) => {
        const result = await checkCandidateBooking(candidateId);
        if (result.success) {
            toast.success(`Booking Found: ${new Date(result.date).toLocaleString()}`);
        } else if (result.message) {
            toast.info(result.message);
        } else {
            toast.error(result.error);
        }
    };

    const handleOpenApproveDialog = (candidateId: string) => {
        setSheetOpen(false);
        setSelectedCandidateId(candidateId);
        setIsApproveDialogOpen(true);
    };

    const filteredCandidates = useMemo(() => {
        if (filterStatus === "ALL") return candidates;

        return candidates.filter(candidate => {
            const interviewStatus = (candidate as any).interviewStatus;

            if (filterStatus === "INVITE_SENT") {
                return interviewStatus === "INVITE_SENT";
            }
            if (filterStatus === "SCHEDULED") {
                return interviewStatus === "SCHEDULED";
            }

            // Standard status matches
            return candidate.status === filterStatus;
        });
    }, [candidates, filterStatus]);

    if (candidates.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No candidates have applied yet.
            </div>
        );
    }

    const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-card border rounded-lg p-3 shadow-sm mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">Candidates</h2>
                    <div className="flex items-center justify-center px-2 py-0.5 rounded-full border bg-muted/30 text-xs font-medium text-muted-foreground">
                        {filteredCandidates.length}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh Candidates" className="h-9 w-9">
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                    </Button>
                    <div className="flex items-center gap-2">
                        {mounted ? (
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[180px] h-9">
                                    <div className="flex items-center gap-2 w-full min-w-0">
                                        <Filter className="w-4 h-4 shrink-0 opacity-50" />
                                        <span className="truncate text-left">
                                            <SelectValue placeholder="All Candidates" />
                                        </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent position="popper" align="start">
                                    <SelectItem value="ALL">All Candidates</SelectItem>
                                    <SelectItem value="ASSIGNMENT SENT">Assignment Sent</SelectItem>
                                    <SelectItem value="ASSIGNMENT RECEIVED">Assignment Received</SelectItem>
                                    <SelectItem value="INVITE_SENT">Invite Sent</SelectItem>
                                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="w-[180px] h-9 border rounded-md bg-background animate-pulse" />
                        )}
                    </div>

                    {!isConnected ? (
                        <Button
                            variant="outline"
                            className="gap-2 h-9"
                            onClick={handleConnectCalendar}
                        >
                            <Calendar className="w-4 h-4" />
                            Connect Calendar
                        </Button>
                    ) : (
                        <div className="h-9 flex items-center px-3 rounded-md border bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-sm font-medium gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Calendar Connected
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-3 h-10">Name</TableHead>
                            <TableHead className="px-3 h-10">Applied</TableHead>
                            <TableHead className="px-3 h-10">Status</TableHead>
                            <TableHead className="px-3 h-10 w-[100px] text-left">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCandidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No candidates found with this status.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCandidates.map((candidate) => (
                                <TableRow key={candidate.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium p-3">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{candidate.name}</span>
                                            <span className="text-xs text-muted-foreground">{candidate.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-3 text-muted-foreground text-sm">{format(new Date(candidate.createdAt), "MMM d, yyyy")}</TableCell>
                                    <TableCell className="p-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={candidate.status === "ASSIGNMENT SENT" ? "default" : candidate.status === "ASSIGNMENT RECEIVED" ? "secondary" : candidate.status === "APPROVED" ? "default" : candidate.status === "REJECTED" ? "destructive" : "secondary"}
                                                className={
                                                    candidate.status === "ASSIGNMENT SENT" ? "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-0 shadow-none font-medium" :
                                                        candidate.status === "ASSIGNMENT RECEIVED" ? "bg-purple-500/15 text-purple-600 hover:bg-purple-500/25 border-0 shadow-none font-medium" :
                                                            candidate.status === "APPROVED" ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-0 shadow-none font-medium" :
                                                                candidate.status === "REJECTED" ? "bg-destructive/15 text-destructive hover:bg-destructive/25 border-0 shadow-none font-medium" :
                                                                    "shadow-none font-medium"
                                                }>
                                                {candidate.status}
                                            </Badge>
                                            {(candidate as any).interviewStatus && (
                                                <Badge variant="outline" className="text-blue-600 bg-blue-500/10 border-blue-500/20 shadow-none font-medium">
                                                    {(candidate as any).interviewStatus === "INVITE_SENT" ? "Invite Sent" : "Scheduled"}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-3 text-left">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 relative"
                                            onClick={() => {
                                                setSelectedCandidateId(candidate.id);
                                                setSheetOpen(true);
                                            }}
                                        >
                                            View Details
                                            {candidate.status === "ASSIGNMENT RECEIVED" && (
                                                <span className="absolute top-1.5 right-1 flex h-2 w-2 pointer-events-none">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                </span>
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Candidate Details Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:w-[540px] p-0 flex flex-col gap-0 border-l shadow-2xl transition-all duration-300 ease-in-out">
                    <SheetHeader className="flex flex-row items-center justify-between p-5 border-b shrink-0 space-y-0 text-left">
                        <div className="flex flex-col gap-2">
                            <SheetTitle className="text-xl font-semibold leading-none">Candidate Profile</SheetTitle>
                            <SheetDescription className="text-sm text-muted-foreground leading-none">Applicant details & status</SheetDescription>
                        </div>
                    </SheetHeader>

                    {selectedCandidate && (
                        <>
                            <div className="flex-1 overflow-y-auto p-5 space-y-8">
                                {/* 1. Candidate Details (Top Priority) */}
                                <section className="space-y-5">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-bold tracking-tight text-foreground">{selectedCandidate.name}</h3>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="w-4 h-4" />
                                                <a href={`mailto:${selectedCandidate.email}`} className="text-sm hover:text-foreground transition-colors hover:underline">
                                                    {selectedCandidate.email}
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {selectedCandidate.resumeUrl && (
                                            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm" asChild>
                                                <a
                                                    href={
                                                        selectedCandidate.resumeUrl?.startsWith('data:')
                                                            ? `/api/view-document?candidateId=${selectedCandidate.id}&type=resume`
                                                            : selectedCandidate.resumeUrl
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 hover:bg-muted rounded-md inline-block"
                                                >                                                 <FileText className="w-4 h-4 text-blue-500" />
                                                    View Resume
                                                </a>
                                            </Button>
                                        )}
                                        {selectedCandidate.portfolioUrl && (
                                            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm" asChild>
                                                <a href={selectedCandidate.portfolioUrl} target="_blank" rel="noopener noreferrer">
                                                    <Briefcase className="w-4 h-4 text-orange-500" />
                                                    Portfolio
                                                </a>
                                            </Button>
                                        )}
                                    </div>

                                    {/* Application Key Details - Clean Layout with Divider */}
                                    {(selectedCandidate.yearsOfExperience || selectedCandidate.currentOrg || selectedCandidate.noticePeriod) && (
                                        <div className="flex items-center flex-wrap gap-y-4 py-2">
                                            {selectedCandidate.yearsOfExperience && (
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Experience</span>
                                                    <p className="text-sm font-medium text-foreground">{selectedCandidate.yearsOfExperience}</p>
                                                </div>
                                            )}

                                            {/* Divider */}
                                            {selectedCandidate.yearsOfExperience && selectedCandidate.currentOrg && (
                                                <div className="h-8 mx-6 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
                                            )}

                                            {selectedCandidate.currentOrg && (
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Current Org</span>
                                                    <p className="text-sm font-medium text-foreground">{selectedCandidate.currentOrg}</p>
                                                </div>
                                            )}

                                            {/* Divider if Notice Period exists and (Exp OR Org exists) */}
                                            {(selectedCandidate.yearsOfExperience || selectedCandidate.currentOrg) && selectedCandidate.noticePeriod && (
                                                <div className="h-8 mx-6 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
                                            )}

                                            {selectedCandidate.noticePeriod && (
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Notice Period</span>
                                                    <p className="text-sm font-medium text-foreground">{selectedCandidate.noticePeriod}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </section>

                                {/* 2. Internal Status */}
                                <section className="space-y-3 pt-2">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        Internal Status
                                        <div className="h-px bg-border flex-1" />
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={selectedCandidate.status === "ASSIGNMENT SENT" ? "default" : selectedCandidate.status === "REJECTED" ? "destructive" : "secondary"}
                                            className={cn(
                                                "px-3 py-1 text-sm font-medium shadow-sm transition-colors",
                                                selectedCandidate.status === "APPROVED" && "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-0",
                                                selectedCandidate.status === "ASSIGNMENT SENT" && "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-0",
                                                selectedCandidate.status === "ASSIGNMENT RECEIVED" && "bg-purple-500/15 text-purple-600 hover:bg-purple-500/25 border-0"
                                            )}>
                                            {selectedCandidate.status}
                                        </Badge>
                                    </div>
                                </section>

                                {/* 3. AI Screening Results (Enhanced) */}
                                <section className="space-y-3 pt-2">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-purple-500" />
                                        AI Analysis
                                        <div className="h-px bg-border flex-1" />
                                    </h4>
                                    {(selectedCandidate as any).screeningScore !== null && (selectedCandidate as any).screeningScore !== undefined ? (
                                        <div className="bg-card border rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                                            <div className="p-4 space-y-5">
                                                {/* Header Row */}
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                                                            <div className="absolute inset-0 rounded-full bg-muted/20" />
                                                            <svg className="w-full h-full transform -rotate-90">
                                                                <circle
                                                                    cx="20"
                                                                    cy="20"
                                                                    r="17"
                                                                    className="stroke-muted/30 fill-none"
                                                                    strokeWidth="3"
                                                                />
                                                                <circle
                                                                    cx="20"
                                                                    cy="20"
                                                                    r="17"
                                                                    className={cn(
                                                                        "fill-none transition-all duration-1000 ease-out",
                                                                        (selectedCandidate as any).screeningScore >= 70 ? "stroke-emerald-500" : "stroke-destructive"
                                                                    )}
                                                                    strokeWidth="3"
                                                                    strokeLinecap="round"
                                                                    strokeDasharray={2 * Math.PI * 17}
                                                                    strokeDashoffset={2 * Math.PI * 17 * (1 - (selectedCandidate as any).screeningScore / 100)}
                                                                />
                                                            </svg>
                                                            <span className={cn(
                                                                "absolute inset-0 flex items-center justify-center text-[14px] font-bold",
                                                                (selectedCandidate as any).screeningScore >= 70 ? "text-emerald-600" : "text-destructive"
                                                            )}>
                                                                {(selectedCandidate as any).screeningScore}
                                                            </span>
                                                        </div>
                                                        <h5 className="font-semibold text-foreground truncate">Resume Screening</h5>
                                                    </div>

                                                    <Badge variant="outline" className={cn(
                                                        "border-0 font-bold px-2.5 py-1 text-[10px] tracking-wide",
                                                        (selectedCandidate as any).screeningScore >= 70
                                                            ? "bg-emerald-500/10 text-emerald-600"
                                                            : "bg-destructive/10 text-destructive"
                                                    )}>
                                                        {(selectedCandidate as any).screeningScore >= 70 ? "PASSED" : "FAILED"}
                                                    </Badge>
                                                </div>

                                                {/* Reasoning Text */}
                                                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                    {(selectedCandidate as any).screeningReason || "Analysis based on job description match."}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic">No AI screening data available.</div>
                                    )}
                                </section>



                                {/* 4. Interview Status */}
                                {
                                    ((selectedCandidate as any).interviewStatus === "INVITE_SENT" || ((selectedCandidate as any).interviewStatus === "SCHEDULED" && (selectedCandidate as any).interviewDate)) && (
                                        <section className="space-y-3 pt-2">
                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                Interview
                                                <div className="h-px bg-border flex-1" />
                                            </h4>

                                            {(selectedCandidate as any).interviewStatus === "INVITE_SENT" && (
                                                <div className="bg-blue-50/40 border border-blue-200/60 rounded-lg p-4 flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-100/50 rounded-full text-blue-600">
                                                            <Mail className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-blue-900">Waitlist: Invite Sent</p>
                                                            <p className="text-xs text-blue-700/80">Waiting for candidate booking</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800" onClick={() => handleCheckBooking(selectedCandidate.id)}>
                                                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                                        Refresh
                                                    </Button>
                                                </div>
                                            )}

                                            {(selectedCandidate as any).interviewStatus === "SCHEDULED" && (selectedCandidate as any).interviewDate && (
                                                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                                                    {/* Header Strip - Primary Gradient */}
                                                    <div className="h-1.5 w-full bg-gradient-to-r from-[#facc15] to-[#f59e0b]" />
                                                    <div className="p-5 space-y-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400 shrink-0">
                                                                <Calendar className="w-5 h-5" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h5 className="font-semibold text-foreground">Interview Scheduled</h5>
                                                                <p className="text-2xl font-bold text-foreground tracking-tight">
                                                                    {format(new Date((selectedCandidate as any).interviewDate), "h:mm a")}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground font-medium">
                                                                    {format(new Date((selectedCandidate as any).interviewDate), "EEEE, MMMM do, yyyy")}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {(selectedCandidate as any).meetingLink && (
                                                            <a href={(selectedCandidate as any).meetingLink} target="_blank" rel="noopener noreferrer" className="block group">
                                                                <div className="relative transform transition-transform duration-100 active:translate-y-1">
                                                                    <div className={cn(
                                                                        "flex items-center justify-center gap-3 px-6 py-2.5 text-base font-bold rounded-full",
                                                                        "bg-gradient-to-b from-[#fef08a] to-[#facc15] text-black", // Lighter yellow gradient
                                                                        "shadow-[inset_0_2px_2px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.1)]", // Strong gloss
                                                                        "border border-[#fbbf24] hover:brightness-105 transition-all" // Amber-400 border
                                                                    )}>
                                                                        <span className="flex items-center gap-2">
                                                                            Join Video Call
                                                                            <div className="bg-black rounded-full p-1 flex items-center justify-center">
                                                                                <ExternalLink className="w-3.5 h-3.5 text-[#facc15] stroke-[3px] group-hover:scale-110 transition-transform duration-300" />
                                                                            </div>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </section>
                                    )
                                }


                                {/* 5. Assignment Submission */}
                                {
                                    (selectedCandidate.assignmentSubmission) && (
                                        <section className="space-y-3 pt-2">
                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                Assignment
                                                <div className="h-px bg-border flex-1" />
                                            </h4>
                                            <div className="bg-card border rounded-lg p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow group">
                                                <div className="p-2.5 bg-muted rounded-md text-foreground">
                                                    {selectedCandidate.assignmentSubmission.includes("/uploads") ? <FileIcon className="h-5 w-5" /> : <ExternalLink className="h-5 w-5" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {selectedCandidate.assignmentSubmission.split('/').pop() || "Submission Link"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Click to view submission</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="shrink-0" asChild>
                                                    <a href={
                                                        selectedCandidate.assignmentSubmission.startsWith('data:')
                                                            ? `/api/view-document?candidateId=${selectedCandidate.id}&type=assignment`
                                                            : selectedCandidate.assignmentSubmission
                                                    } target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </section>
                                    )
                                }

                            </div >

                            {/* Sticky Footer Actions - Clean, no title */}
                            < div className="p-5 border-t bg-background mt-auto sticky bottom-0 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]" >
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm h-11 group gap-2"
                                        disabled={selectedCandidate.status === "APPROVED" || selectedCandidate.status === "REJECTED"}
                                        onClick={() => handleOpenApproveDialog(selectedCandidate.id)}
                                    >
                                        <CheckCircle2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                                        Approve
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive font-medium h-11 group gap-2"
                                        disabled={selectedCandidate.status === "APPROVED" || selectedCandidate.status === "REJECTED"}
                                        onClick={async () => {
                                            const result = await rejectCandidate(selectedCandidate.id);
                                            if (result.success) {
                                                toast.success("Candidate rejected");
                                                setSheetOpen(false);
                                            } else {
                                                toast.error("Failed to reject candidate");
                                            }
                                        }}
                                    >
                                        <XCircle className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                                        Reject
                                    </Button>
                                </div>
                            </div >
                        </>
                    )
                    }
                </SheetContent >
            </Sheet >

            {/* Approval Dialog - Outside Sheet, Wider */}
            < Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen} >
                <DialogContent className="sm:max-w-6xl w-[95vw] max-w-[95vw]">
                    <DialogHeader>
                        <DialogTitle>Approve Candidate & Propose Interview Times</DialogTitle>
                        <DialogDescription>
                            Select up to 3 time slots for the interview. The candidate will receive an email to confirm one of these times.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedCandidateId && (
                            <SlotPicker onSlotsChange={setSelectedSlots} />
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full sm:w-auto"
                            disabled={selectedSlots.length === 0}
                            onClick={async () => {
                                if (!selectedCandidateId) return;
                                if (selectedSlots.length === 0) {
                                    toast.error("Please select at least one time slot");
                                    return;
                                }

                                const { proposeInterviewSlots } = await import("@/app/actions/availability");
                                const result = await proposeInterviewSlots(selectedCandidateId, selectedSlots);

                                if (result.success) {
                                    toast.success("Candidate approved and slots proposed");
                                    setIsApproveDialogOpen(false);
                                    setSelectedSlots([]);
                                    setSelectedCandidateId(null);
                                } else {
                                    toast.error(result.error || "Failed to approve candidate");
                                }
                            }}>
                            Send Approval & Options
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div >
    );
}
