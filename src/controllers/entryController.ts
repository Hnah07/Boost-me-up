import { Request, Response } from "express";
import Entry from "../models/EntryModel";
import { Types } from "mongoose";

interface SanitizedEntry {
  _id: Types.ObjectId;
  content: string;
  user: Types.ObjectId;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create a new entry
export const createEntry = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const entry = await Entry.create({
      content,
      originalContent: content,
      user: userId,
      isPrivate: true,
    });

    const sanitizedEntry = {
      ...entry.toObject(),
      content: entry.originalContent,
    } as SanitizedEntry;

    res.status(201).json(sanitizedEntry);
  } catch (error) {
    res.status(500).json({ message: "Error creating entry", error });
  }
};

// Get all entries for the authenticated user
export const getUserEntries = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const entries = await Entry.find({ user: userId }).sort({ createdAt: -1 });

    const sanitizedEntries = entries.map((entry) => {
      const sanitized = {
        ...entry.toObject(),
        content: entry.originalContent,
      } as SanitizedEntry;
      return sanitized;
    });

    res.json(sanitizedEntries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching entries", error });
  }
};

// Get a single entry
export const getEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const entry = await Entry.findOne({ _id: id, user: userId });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const sanitizedEntry = {
      ...entry.toObject(),
      content: entry.originalContent,
    } as SanitizedEntry;

    res.json(sanitizedEntry);
  } catch (error) {
    res.status(500).json({ message: "Error fetching entry", error });
  }
};

// Update an entry
export const updateEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const entry = await Entry.findOneAndUpdate(
      { _id: id, user: userId },
      {
        content,
        originalContent: content,
      },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const sanitizedEntry = {
      ...entry.toObject(),
      content: entry.originalContent,
    } as SanitizedEntry;

    res.json(sanitizedEntry);
  } catch (error) {
    res.status(500).json({ message: "Error updating entry", error });
  }
};

// Delete an entry
export const deleteEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const entry = await Entry.findOneAndDelete({ _id: id, user: userId });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting entry", error });
  }
};
