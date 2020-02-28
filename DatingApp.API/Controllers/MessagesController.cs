using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.DTOs;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using System;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivityActionFilter))]
    [Authorize]
    [Route("api/users/{userId}/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;
        public MessagesController(IDatingRepository repo, IMapper mapper)
        {
            this._mapper = mapper;
            this._repo = repo;
        }

        [HttpGet("{messageId}", Name="GetMessage")]
        public async Task<IActionResult> GetMessage(int userId, int messageId)
        {
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var messageFromRepo = await this._repo.GetMessage(messageId);

            if(messageFromRepo == null)
                return BadRequest("Message not found");

            return Ok(messageFromRepo);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage(int userId, MessageForCreationDto messageForCreationDto)
        {
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            messageForCreationDto.SenderId = userId;

            var recipient = await this._repo.GetUser(messageForCreationDto.RecipientId);
            if(recipient == null)
                return BadRequest("Could not find user");

            var mappedMessage = _mapper.Map<Message>(messageForCreationDto);
            this._repo.Add(mappedMessage);
            if (await this._repo.SaveAll())
            {
                var messageToReturn = _mapper.Map<MessageForCreationDto>(mappedMessage);
                return CreatedAtAction("GetMessage", new { userId, messageId = mappedMessage.Id }, messageToReturn);
            }
            else
                throw new Exception("Creating the message failed on save");
        }

        [HttpGet]
        public async Task<IActionResult> GetMessagesForUser(int userId, [FromQuery] MessageParams messageParams)
        {
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            messageParams.UserId = userId;

            var messagesFromRepo = await this._repo.GetMessagesForUser(messageParams);
            var messages = this._mapper.Map<IEnumerable<MessageToReturnDto>>(messagesFromRepo);

            Response.AddPagination(messagesFromRepo.CurrentPage, messagesFromRepo.PageSize, 
                                   messagesFromRepo.TotalCount, messagesFromRepo.TotalPages);

            return Ok(messages);
        }

        [HttpGet("thread/{recipientUserId}")]
        public async Task<IActionResult> GetMessageThread(int userId, int recipientUserId)
        {
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var messageFromRepo = await this._repo.GetMessageThread(userId, recipientUserId);

            var messageThread = this._mapper.Map<IEnumerable<MessageToReturnDto>>(messageFromRepo);

            return Ok(messageThread);
        }

   
    }
}