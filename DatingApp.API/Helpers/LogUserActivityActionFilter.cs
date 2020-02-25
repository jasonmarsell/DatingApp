using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

using DatingApp.API.Data;

namespace DatingApp.API.Helpers
{
    public class LogUserActivityActionFilter : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var resultContext = await next();

            var userId = int.Parse(resultContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var repo = resultContext.HttpContext.RequestServices.GetService<IDatingRepository>();

            var userFromRepo = await repo.GetUser(userId);
            userFromRepo.LastActive = DateTime.Now;
            await repo.SaveAll();
        }
    }
}